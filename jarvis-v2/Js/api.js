import { CONFIG } from './config.js';
import { TerminalLogger } from './logger.js';

export async function callGeminiAPI(promptText, base64Image = null, history = []) {
  const apiKey = CONFIG.getApiKey();
  if (!apiKey) {
    throw new Error('API key is missing. Please configure your Gemini API key.');
  }

  const endpoint = `${CONFIG.API_URL}${CONFIG.MODEL_NAME}:generateContent?key=${apiKey}`;

  const contents = history.map(turn => ({
    role: turn.role === 'user' ? 'user' : 'model',
    parts: [{ text: turn.text }]
  }));

  const currentParts = [{ text: promptText }];
  if (base64Image) {
    const [mimeTypePrefix, base64Data] = base64Image.split(';base64,');
    const mimeType = mimeTypePrefix ? mimeTypePrefix.replace('data:', '') : 'image/jpeg';
    if (base64Data) {
      currentParts.push({
        inline_data: { mime_type: mimeType, data: base64Data }
      });
    }
  }

  contents.push({ role: 'user', parts: currentParts });

  const payload = {
    system_instruction: { parts: [{ text: CONFIG.SYSTEM_INSTRUCTION }] },
    contents: contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
  };

  const startTime = performance.now();
  TerminalLogger.log(`Dispatching payload to ${CONFIG.MODEL_NAME}...`, 'info');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    if (!response.ok) {
      const errData = await response.json();
      const errorMsg = errData.error?.message || `HTTP ${response.status}`;
      TerminalLogger.log(`API Error (${durationMs}ms): ${errorMsg}`, 'error');
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const usage = data.usageMetadata;
    if (usage) {
      TerminalLogger.log(`Latency: ${durationMs}ms | Tokens [Prompt: ${usage.promptTokenCount}, Out: ${usage.candidatesTokenCount}]`, 'metric');
    } else {
      TerminalLogger.log(`Latency: ${durationMs}ms`, 'metric');
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) throw new Error('Empty response received from model.');
    return replyText;

  } catch (error) {
    TerminalLogger.log(`Fetch Exception: ${error.message}`, 'error');
    throw error;
  }
}
