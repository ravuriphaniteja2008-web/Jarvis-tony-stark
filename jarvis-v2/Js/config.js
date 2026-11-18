export const CONFIG = {
  MODEL_NAME: 'gemini-3-flash-preview',
  API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/',
  
  SYSTEM_INSTRUCTION: `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), an advanced personal AI assistant built for Teja. Speak with concise, highly competent, professional, and slightly witty authority. Keep spoken responses brief and action-oriented.`,

  getApiKey() {
    let key = localStorage.getItem('jarvis_gemini_api_key');
    if (!key) {
      key = prompt('Enter your Google AI Studio Gemini API Key:');
      if (key) {
        localStorage.setItem('jarvis_gemini_api_key', key.trim());
      }
    }
    return key || '';
  }
};
