import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { findQAMatch } from '@/lib/nrsolution-qa'

const apiKeys = [
  process.env.GEMINI_API_KEY!,
  process.env.GEMINI_API_KEY_2!,
].filter(Boolean)

function getGenAI(keyIndex = 0) {
  return new GoogleGenerativeAI(apiKeys[keyIndex % apiKeys.length])
}

// Supported mime types for Gemini inline data
const GEMINI_SUPPORTED = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'text/plain', 'text/csv',
]

const resumePrompt = `You are an expert Resume Analyzer. Analyze this resume and provide a detailed report in EXACTLY this format:

## 📋 Resume Analyzer – Result Report

### 👤 Candidate Details
- **Name:** [Extract from resume]
- **Email:** [Extract from resume]
- **Contact Number:** [Extract from resume]
- **Position Applied For:** [Extract or suggest based on skills]

---
### ⭐ Overall Resume Score: [XX / 100]

---

### 1. 📐 Resume Structure & Formatting
**Score: [XX / 20]**
- Resume layout is [clear/cluttered/inconsistent]
- Font and spacing are [professional/need improvement]
- Section alignment is [proper/needs correction]

### 2. 🎯 Career Objective / Summary
**Score: [XX / 10]**
- Objective is [clear/generic/missing]
- [Specific feedback]

### 3. 💻 Technical Skills
**Score: [XX / 20]**
- Skills listed are [relevant/outdated/incomplete]
- [Missing key technologies if any]

### 4. 🚀 Projects & Practical Experience
**Score: [XX / 20]**
- Projects are [well explained/lack detail]
- [Specific feedback on projects]

### 5. 🎓 Education Details
**Score: [XX / 10]**
- Academic information is [complete/missing details]
- [Specific feedback]

### 6. 🏆 Achievements & Certifications
**Score: [XX / 10]**
- Certifications are [relevant/limited/missing]
- [Specific feedback]

### 7. ✍️ Communication & Language Quality
**Score: [XX / 10]**
- Grammar and spelling are [good/need improvement]
- [Specific feedback]

### 8. 🔍 Keywords & ATS Compatibility
**Score: [XX / 10]**
- Resume is [ATS-friendly/not optimized]
- [Missing keywords if any]

---

### ✅ Final Feedback

**💪 Strengths:**
- [List 3-4 strengths]

**📈 Areas for Improvement:**
- [List 3-4 improvements]

Be specific, accurate and helpful. Extract real data from the resume.`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const question = (formData.get('question') as string) || 'Analyze this file and give career-related insights.'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    if (file.size > 10 * 1024 * 1024)
      return NextResponse.json({ error: 'File too large. Max 10MB allowed.' }, { status: 400 })

    const allowedTypes = [...GEMINI_SUPPORTED, 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type))
      return NextResponse.json({ error: 'File type not supported. Use images, PDF, Word, or TXT.' }, { status: 400 })

    const isResume = /resume|cv/i.test(file.name) ||
      /resume|cv|curriculum/i.test(question) ||
      question === 'Analyze this file and give career-related insights.'

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // For Word docs — extract as text since Gemini doesn't support them natively
    const isWordDoc = file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite']
    let response = ''

    for (let keyIdx = 0; keyIdx < apiKeys.length; keyIdx++) {
      for (const modelName of models) {
        try {
          const model = getGenAI(keyIdx).getGenerativeModel({ model: modelName })

          let result
          if (isWordDoc) {
            // Send as plain text prompt for Word docs
            const textContent = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim()
            const prompt = isResume
              ? `${resumePrompt}\n\nResume content:\n${textContent.slice(0, 8000)}`
              : `${question}\n\nFile content:\n${textContent.slice(0, 8000)}`
            result = await model.generateContent(prompt)
          } else {
            const base64 = buffer.toString('base64')
            const mimeType = file.type as any
            result = await model.generateContent([
              { inlineData: { mimeType, data: base64 } },
              { text: isResume ? resumePrompt : `You are a helpful career assistant. ${question}` }
            ])
          }

          response = result.response.text()
          break
        } catch (e: any) {
          if (e?.status === 503 || e?.status === 429) {
            await new Promise(resolve => setTimeout(resolve, 1500))
            continue
          }
          console.error(`Model ${modelName} error:`, e?.message)
          continue
        }
      }
      if (response) break
    }

    if (!response) {
      // Fallback for resume analyzer — try Q&A match on filename/question
      const qaFallback = findQAMatch(question)
      if (qaFallback) return NextResponse.json({ response: qaFallback })

      return NextResponse.json({
        response: `⚠️ AI service is currently busy. Please try again in 30 seconds.\n\nIf you uploaded a resume, make sure it's in **PDF format** for best results.`
      })
    }

    return NextResponse.json({ response, fileName: file.name, fileType: file.type })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Failed to analyze file' }, { status: 500 })
  }
}
