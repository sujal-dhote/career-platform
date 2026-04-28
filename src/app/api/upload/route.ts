import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { findQAMatch } from '@/lib/nrsolution-qa'

export const maxDuration = 60

const apiKeys = [
  process.env.GEMINI_API_KEY!,
  process.env.GEMINI_API_KEY_2!,
  process.env.GEMINI_API_KEY_3!,
].filter(Boolean)

function getGenAI(keyIndex = 0) {
  return new GoogleGenerativeAI(apiKeys[keyIndex % apiKeys.length])
}

const resumePrompt = `You are an expert Resume Analyzer. Carefully read the uploaded resume document and provide a detailed report:

## 📋 Resume Analyzer – Result Report

### 👤 Candidate Details
- **Name:** [Extract from resume]
- **Email:** [Extract from resume]
- **Contact Number:** [Extract from resume]
- **Position Applied For:** [Extract or suggest based on skills]

---
### ⭐ Overall Resume Score: [XX / 100]

---

### 1. 📐 Resume Structure & Formatting — Score: [XX / 20]
- Layout: [clear/cluttered/inconsistent]
- Font and spacing: [professional/need improvement]

### 2. 🎯 Career Objective / Summary — Score: [XX / 10]
- Objective: [clear/generic/missing]
- [Specific feedback]

### 3. 💻 Technical Skills — Score: [XX / 20]
- Skills: [relevant/outdated/incomplete]
- [Missing key technologies]

### 4. 🚀 Projects & Experience — Score: [XX / 20]
- Projects: [well explained/lack detail]
- [Specific feedback]

### 5. 🎓 Education — Score: [XX / 10]
- [Complete/missing details feedback]

### 6. 🏆 Achievements & Certifications — Score: [XX / 10]
- [Relevant/limited/missing feedback]

### 7. ✍️ Language Quality — Score: [XX / 10]
- Grammar: [good/needs improvement]

### 8. 🔍 ATS Compatibility — Score: [XX / 10]
- ATS: [friendly/not optimized]
- Missing keywords: [list them]

---
### ✅ Final Feedback
**💪 Strengths:** [3 specific strengths from the resume]
**📈 Improvements:** [3 specific improvements needed]`

const ATS_TEMPLATE_MSG = `\n\n---\n\n### 📥 Download ATS-Friendly Resume Template\n\nImprove your resume using this professionally designed ATS-optimized template:\n\n**[⬇️ Download ATS Resume Template (PDF)](https://career-platform-omega.vercel.app/ats-resume-template.pdf)**\n\n> This template follows all ATS best practices — clean formatting, proper sections, keyword-optimized structure.`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const question = (formData.get('question') as string) || 'Analyze this file and give career-related insights.'
    const agentType = (formData.get('agentType') as string) || ''

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 })

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    if (!allowedTypes.includes(file.type))
      return NextResponse.json({ error: 'File type not supported.' }, { status: 400 })

    const isResume = agentType === 'resume_analyzer' ||
      /resume|cv/i.test(file.name) ||
      /resume|cv|curriculum/i.test(question)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    // All files — send as inline data directly to Gemini
    // Gemini natively supports: PDF, images, text, Word docs
    let mimeType = file.type as string
    // Fix Word doc mime type — treat as PDF for Gemini
    if (mimeType === 'application/msword' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      mimeType = 'application/pdf'
    }

    const promptText = isResume
      ? resumePrompt
      : `You are a helpful career assistant. ${question}`

    // Use gemini-2.0-flash first — best for document reading
    const models = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.0-flash-lite']
    let response = ''

    for (let keyIdx = 0; keyIdx < apiKeys.length; keyIdx++) {
      for (const modelName of models) {
        try {
          const model = getGenAI(keyIdx).getGenerativeModel({ model: modelName })
          const result = await model.generateContent([
            {
              inlineData: {
                mimeType: mimeType as any,
                data: base64
              }
            },
            { text: promptText }
          ])
          response = result.response.text()
          if (response) break
        } catch (e: any) {
          if (e?.status === 503 || e?.status === 429) {
            await new Promise(r => setTimeout(r, 2000))
            continue
          }
          console.error(`Upload error key${keyIdx} ${modelName}:`, e?.status, e?.message)
          continue
        }
      }
      if (response) break
    }

    if (!response) {
      const qaFallback = findQAMatch(question)
      if (qaFallback) return NextResponse.json({ response: qaFallback })
      return NextResponse.json({
        response: `⚠️ AI service is currently busy. Please try again in 30 seconds.`
      })
    }

    return NextResponse.json({
      response: isResume ? response + ATS_TEMPLATE_MSG : response,
      fileName: file.name
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Failed to analyze file' }, { status: 500 })
  }
}
