import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Use the fastest model for translation
const TRANSLATION_MODEL = 'gemini-2.5-flash-lite' // Fastest model

export async function POST(request: NextRequest) {
  let originalText = ''
  
  try {
    const { text, targetLanguage } = await request.json()
    originalText = text

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      )
    }

    // Language instruction mapping (optimized for speed)
    const languageInstructions: Record<string, string> = {
      en: 'Translate to English:',
      hi: 'हिंदी में अनुवाद करें:',
      hinglish: 'Translate to Hinglish (Hindi in Roman script with English words):',
      mr: 'मराठीत भाषांतर करा:',
      es: 'Traduce al español:',
      fr: 'Traduisez en français:',
      de: 'Übersetzen Sie ins Deutsche:',
      zh: '翻译成中文:',
      ja: '日本語に翻訳:',
      ar: 'ترجم إلى العربية:',
      pt: 'Traduza para o português:'
    }

    const instruction = languageInstructions[targetLanguage] || languageInstructions.en

    // Use fastest model with optimized prompt
    const model = genAI.getGenerativeModel({ 
      model: TRANSLATION_MODEL,
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent translations
        maxOutputTokens: 2048,
      }
    })
    
    // Simplified prompt for faster processing
    const prompt = `${instruction}\n${text}`
    
    const result = await model.generateContent(prompt)
    const response = result.response
    const translatedText = response.text().trim()

    return NextResponse.json({
      translatedText,
      originalText: text,
      targetLanguage
    })
  } catch (error) {
    console.error('Translation error:', error)
    // Return original text on error
    return NextResponse.json(
      { error: 'Translation failed', translatedText: originalText },
      { status: 200 } // Return 200 to avoid breaking the UI
    )
  }
}
