// LLM Configuration and Provider Management

export type LLMProvider = 'gemini' | 'openai' | 'claude' | 'groq' | 'ollama'

export interface LLMConfig {
  provider: LLMProvider
  apiKey?: string
  model: string
  baseURL?: string
  temperature?: number
  maxTokens?: number
}

// Default configurations for each provider
export const defaultConfigs: Record<LLMProvider, Omit<LLMConfig, 'apiKey'>> = {
  gemini: {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    maxTokens: 2048
  },
  openai: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2048
  },
  claude: {
    provider: 'claude',
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    maxTokens: 2048
  },
  groq: {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    baseURL: 'https://api.groq.com/openai/v1',
    temperature: 0.7,
    maxTokens: 2048
  },
  ollama: {
    provider: 'ollama',
    model: 'llama3.2',
    baseURL: 'http://localhost:11434',
    temperature: 0.7,
    maxTokens: 2048
  }
}

// Available models for each provider
export const availableModels: Record<LLMProvider, string[]> = {
  gemini: [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-1.5-pro'
  ],
  openai: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo'
  ],
  claude: [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ],
  groq: [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'mixtral-8x7b-32768',
    'gemma2-9b-it'
  ],
  ollama: [
    'llama3.2',
    'llama3.1',
    'mistral',
    'phi3',
    'qwen2.5'
  ]
}

// Get LLM configuration from environment variables
export function getLLMConfig(): LLMConfig {
  const provider = (process.env.LLM_PROVIDER || 'gemini') as LLMProvider
  const config = defaultConfigs[provider]
  
  // Get API key based on provider
  const apiKey = getAPIKey(provider)
  
  // Get custom model if specified
  const model = process.env[`${provider.toUpperCase()}_MODEL`] || config.model
  
  // Get custom base URL if specified (for Groq/Ollama)
  const baseURL = process.env[`${provider.toUpperCase()}_BASE_URL`] || config.baseURL
  
  return {
    ...config,
    model,
    baseURL,
    apiKey
  }
}

// Get API key for specific provider
function getAPIKey(provider: LLMProvider): string | undefined {
  switch (provider) {
    case 'gemini':
      return process.env.GEMINI_API_KEY
    case 'openai':
      return process.env.OPENAI_API_KEY
    case 'claude':
      return process.env.ANTHROPIC_API_KEY
    case 'groq':
      return process.env.GROQ_API_KEY
    case 'ollama':
      return undefined // Ollama doesn't need API key
    default:
      return undefined
  }
}

// Validate if provider is configured
export function isProviderConfigured(provider: LLMProvider): boolean {
  if (provider === 'ollama') return true // Ollama doesn't need API key
  const apiKey = getAPIKey(provider)
  return !!apiKey && apiKey.length > 0
}

// Get all configured providers
export function getConfiguredProviders(): LLMProvider[] {
  return Object.keys(defaultConfigs).filter(provider => 
    isProviderConfigured(provider as LLMProvider)
  ) as LLMProvider[]
}
