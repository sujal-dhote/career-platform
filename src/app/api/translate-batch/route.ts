import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Use the fastest model for translation
const TRANSLATION_MODEL = 'gemini-2.5-flash-lite'

export async function POST(request: NextRequest) {
  try {
    const { messages, targetLanguage } = await request.json()

    if (!messages || !Array.isArray(messages) || !targetLanguage) {
      return NextResponse.json(
        { error: 'Messages array and target language are required' },
        { status: 400 }
      )
    }

    // Language instruction mapping
    const languageInstructions: Record<string, string> = {
      en: 'Translate to English',
      hi: 'हिंदी में अनुवाद करें',
      hinglish: 'Translate to Hinglish (Hindi in Roman script)',
      mr: 'मराठीत भाषांतर करा',
      es: 'Traduce al español',
      fr: 'Traduisez en français',
      de: 'Übersetzen Sie ins Deutsche',
      zh: '翻译成中文',
      ja: '日本語に翻訳',
      ar: 'ترجم إلى العربية',
      pt: 'Traduza para o português'
    }

    const instruction = languageInstructions[targetLanguage] || languageInstructions.en

    // Batch all messages into one prompt for faster processing
    const batchPrompt = `${instruction}. Translate each message below and return ONLY the translations, one per line, in the same order:

${messages.map((msg: string, idx: number) => `${idx + 1}. ${msg}`).join('\n')}

Return format: One translation per line, numbered 1-${messages.length}`

    const model = genAI.getGenerativeModel({ 
      model: TRANSLATION_MODEL,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      }
    })
    
    const result = await model.generateContent(batchPrompt)
    const response = result.response
    const translatedText = response.text().trim()

    // Parse the numbered translations
    const translations = translatedText
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        // Remove numbering (1., 2., etc.)
        return line.replace(/^\d+\.\s*/, '').trim()
      })

    // If parsing fails, return original messages
    if (translations.length !== messages.length) {
      console.warn('Translation count mismatch, returning originals')
      return NextResponse.json({
        translations: messages,
        targetLanguage
      })
    }

    return NextResponse.json({
      translations,
      targetLanguage
    })
  } catch (error) {
    console.error('Batch translation error:', error)
    const { messages } = await request.json()
    return NextResponse.json(
      { error: 'Translation failed', translations: messages || [] },
      { status: 200 }
    )
  }
}
