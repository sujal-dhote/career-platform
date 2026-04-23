// Language configuration and translations
export const languages = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳'
  },
  hinglish: {
    code: 'hinglish',
    name: 'Hinglish',
    nativeName: 'Hinglish (हिंग्लिश)',
    flag: '🇮🇳'
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪'
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳'
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦'
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹'
  }
}

export type LanguageCode = keyof typeof languages

export const defaultLanguage: LanguageCode = 'en'

// UI Translations
export const translations = {
  en: {
    selectLanguage: 'Select Language',
    typeMessage: 'Type your message...',
    send: 'Send',
    back: 'Back',
    aiPoweredAssistant: 'AI-powered career assistant',
    welcomeMessage: 'Hello! I\'m your {agentName}. I\'m here to help you with your career journey. What would you like to know?',
    translating: 'Translating messages...'
  },
  hi: {
    selectLanguage: 'भाषा चुनें',
    typeMessage: 'अपना संदेश लिखें...',
    send: 'भेजें',
    back: 'वापस',
    aiPoweredAssistant: 'AI-संचालित करियर सहायक',
    welcomeMessage: 'नमस्ते! मैं आपका {agentName} हूं। मैं आपकी करियर यात्रा में मदद करने के लिए यहां हूं। आप क्या जानना चाहेंगे?',
    translating: 'संदेशों का अनुवाद हो रहा है...'
  },
  hinglish: {
    selectLanguage: 'Language Select Karein',
    typeMessage: 'Apna message type karein...',
    send: 'Bhejein',
    back: 'Wapas',
    aiPoweredAssistant: 'AI-powered career assistant',
    welcomeMessage: 'Hello! Main aapka {agentName} hoon. Main aapki career journey mein help karne ke liye yahan hoon. Aap kya jaanna chahenge?',
    translating: 'Messages translate ho rahe hain...'
  },
  mr: {
    selectLanguage: 'भाषा निवडा',
    typeMessage: 'तुमचा संदेश टाइप करा...',
    send: 'पाठवा',
    back: 'मागे',
    aiPoweredAssistant: 'AI-चालित करिअर सहाय्यक',
    welcomeMessage: 'नमस्कार! मी तुमचा {agentName} आहे। मी तुमच्या करिअर प्रवासात मदत करण्यासाठी येथे आहे। तुम्हाला काय जाणून घ्यायचे आहे?',
    translating: 'संदेशांचे भाषांतर होत आहे...'
  },
  es: {
    selectLanguage: 'Seleccionar idioma',
    typeMessage: 'Escribe tu mensaje...',
    send: 'Enviar',
    back: 'Atrás',
    aiPoweredAssistant: 'Asistente de carrera con IA',
    welcomeMessage: '¡Hola! Soy tu {agentName}. Estoy aquí para ayudarte con tu trayectoria profesional. ¿Qué te gustaría saber?',
    translating: 'Traduciendo mensajes...'
  },
  fr: {
    selectLanguage: 'Sélectionner la langue',
    typeMessage: 'Tapez votre message...',
    send: 'Envoyer',
    back: 'Retour',
    aiPoweredAssistant: 'Assistant de carrière IA',
    welcomeMessage: 'Bonjour! Je suis votre {agentName}. Je suis là pour vous aider dans votre parcours professionnel. Que souhaitez-vous savoir?',
    translating: 'Traduction des messages...'
  },
  de: {
    selectLanguage: 'Sprache auswählen',
    typeMessage: 'Geben Sie Ihre Nachricht ein...',
    send: 'Senden',
    back: 'Zurück',
    aiPoweredAssistant: 'KI-gestützter Karriereassistent',
    welcomeMessage: 'Hallo! Ich bin Ihr {agentName}. Ich bin hier, um Ihnen bei Ihrer Karriere zu helfen. Was möchten Sie wissen?',
    translating: 'Nachrichten werden übersetzt...'
  },
  zh: {
    selectLanguage: '选择语言',
    typeMessage: '输入您的消息...',
    send: '发送',
    back: '返回',
    aiPoweredAssistant: 'AI职业助手',
    welcomeMessage: '你好！我是你的{agentName}。我在这里帮助你的职业发展。你想知道什么？',
    translating: '正在翻译消息...'
  },
  ja: {
    selectLanguage: '言語を選択',
    typeMessage: 'メッセージを入力...',
    send: '送信',
    back: '戻る',
    aiPoweredAssistant: 'AIキャリアアシスタント',
    welcomeMessage: 'こんにちは！私はあなたの{agentName}です。キャリアの旅をサポートします。何を知りたいですか？',
    translating: 'メッセージを翻訳中...'
  },
  ar: {
    selectLanguage: 'اختر اللغة',
    typeMessage: 'اكتب رسالتك...',
    send: 'إرسال',
    back: 'رجوع',
    aiPoweredAssistant: 'مساعد مهني بالذكاء الاصطناعي',
    welcomeMessage: 'مرحبا! أنا {agentName} الخاص بك. أنا هنا لمساعدتك في رحلتك المهنية. ماذا تريد أن تعرف؟',
    translating: 'جاري ترجمة الرسائل...'
  },
  pt: {
    selectLanguage: 'Selecionar idioma',
    typeMessage: 'Digite sua mensagem...',
    send: 'Enviar',
    back: 'Voltar',
    aiPoweredAssistant: 'Assistente de carreira com IA',
    welcomeMessage: 'Olá! Eu sou seu {agentName}. Estou aqui para ajudá-lo em sua jornada profissional. O que você gostaria de saber?',
    translating: 'Traduzindo mensagens...'
  }
}

export function getTranslation(languageCode: LanguageCode, key: keyof typeof translations.en): string {
  return translations[languageCode]?.[key] || translations.en[key]
}




