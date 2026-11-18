// js/config.js - Gemini API Configuration & Key Management
export const CONFIG = {
  MODEL_NAME: 'gemini-3-flash-preview',
  API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/',
  
  SYSTEM_INSTRUCTION: `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), an advanced personal AI assistant built for Teja. Speak with concise, professional, and slightly witty authority. Support both English and Telugu seamlessly.`,

  getApiKey() {
    let key = localStorage.getItem('jarvis_gemini_api_key');
    
    // If no key is found in storage, prompt the user
    if (!key || key.trim() === '' || key === 'null') {
      key = prompt('Enter your Google AI Studio Gemini API Key (starts with AQ... or AIza...):');
      if (key && key.trim() !== '') {
        localStorage.setItem('jarvis_gemini_api_key', key.trim());
      } else {
        alert('API Key is required for J.A.R.V.I.S. to communicate with Google AI.');
      }
    }
    return localStorage.getItem('jarvis_gemini_api_key') || '';
  },

  // Helper to reset/clear key if you ever need to change it
  clearApiKey() {
    localStorage.removeItem('jarvis_gemini_api_key');
    alert('Stored API key cleared. Refresh the page to re-enter.');
  }
};
