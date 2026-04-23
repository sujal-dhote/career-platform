// Unified LLM Client for Multiple Providers

import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { LLMConfig, LLMProvider } from './llm-config'

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface LLMResponse {
  content: string
  provider: LLMProvider
  model: string
  tokensUsed?: number
}

export class LLMClient {
  private config: LLMConfig
  private geminiClient?: GoogleGenerativeAI
  private openaiClient?: OpenAI
  private claudeClient?: Anthropic

  constructor(config: LLMConfig) {
    this.config = config
    this.initializeClient()
  }

  private initializeClient() {
    switch (this.config.provider) {
      case 'gemini':
        if (this.config.apiKey) {
          this.geminiClient = new GoogleGenerativeAI(this.config.apiKey)
        }
        break
      case 'openai':
        if (this.config.apiKey) {
          this.openaiClient = new OpenAI({
            apiKey: this.config.apiKey
          })
        }
        break
      case 'claude':
        if (this.config.apiKey) {
          this.claudeClient = new Anthropic({
            apiKey: this.config.apiKey
          })
        }
        break
      case 'groq':
        if (this.config.apiKey) {
          this.openaiClient = new OpenAI({
            apiKey: this.config.apiKey,
            baseURL: this.config.baseURL || 'https://api.groq.com/openai/v1'
          })
        }
        break
      case 'ollama':
        this.openaiClient = new OpenAI({
          apiKey: 'ollama', // Ollama doesn't need real API key
          baseURL: this.config.baseURL || 'http://localhost:11434/v1'
        })
        break
    }
  }

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    switch (this.config.provider) {
      case 'gemini':
        return this.generateGemini(messages)
      case 'openai':
      case 'groq':
      case 'ollama':
        return this.generateOpenAI(messages)
      case 'claude':
        return this.generateClaude(messages)
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`)
    }
  }

  private async generateGemini(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized')
    }

    const model = this.geminiClient.getGenerativeModel({ 
      model: this.config.model,
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens
      }
    })

    // Combine system and user messages for Gemini
    const systemMessage = messages.find(m => m.role === 'system')?.content || ''
    const userMessages = messages.filter(m => m.role !== 'system')
    
    // Build conversation history
    const history = userMessages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    const chat = model.startChat({
      history,
      systemInstruction: systemMessage
    })

    const lastMessage = userMessages[userMessages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const response = result.response
    const text = response.text()

    return {
      content: text,
      provider: 'gemini',
      model: this.config.model
    }
  }

  private async generateOpenAI(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.openaiClient) {
      throw new Error('OpenAI-compatible client not initialized')
    }

    const response = await this.openaiClient.chat.completions.create({
      model: this.config.model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens
    })

    return {
      content: response.choices[0]?.message?.content || '',
      provider: this.config.provider,
      model: this.config.model,
      tokensUsed: response.usage?.total_tokens
    }
  }

  private async generateClaude(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.claudeClient) {
      throw new Error('Claude client not initialized')
    }

    // Extract system message
    const systemMessage = messages.find(m => m.role === 'system')?.content || ''
    const conversationMessages = messages.filter(m => m.role !== 'system')

    const response = await this.claudeClient.messages.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens || 2048,
      temperature: this.config.temperature,
      system: systemMessage,
      messages: conversationMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    })

    const content = response.content[0]
    const text = content.type === 'text' ? content.text : ''

    return {
      content: text,
      provider: 'claude',
      model: this.config.model,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens
    }
  }

  // Quick text generation (single prompt)
  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: LLMMessage[] = []
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    
    messages.push({ role: 'user', content: prompt })
    
    const response = await this.generateResponse(messages)
    return response.content
  }
}

// Factory function to create LLM client
export function createLLMClient(config: LLMConfig): LLMClient {
  return new LLMClient(config)
}
