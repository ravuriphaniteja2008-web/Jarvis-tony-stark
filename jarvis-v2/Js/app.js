import { callGeminiAPI } from './api.js';
import { SpeechManager } from './speech.js';
import { ArcReactor } from './reactor.js';
import { TerminalLogger } from './logger.js';
import { QuickActions } from './actions.js';

const state = {
  isThinking: false,
  isListening: false,
  history: [],
  attachedImageBase64: null,
  continuousModeActive: false
};

document.addEventListener('DOMContentLoaded', () => {
  ArcReactor.init('arc-reactor', 'status-label');
  ArcReactor.setState('idle', 'ONLINE');
  TerminalLogger.init('terminal-body');
  TerminalLogger.log('J.A.R.V.I.S. 2.0 initialization complete.', 'info');

  const sendBtn = document.getElementById('send-btn');
  const micBtn = document.getElementById('mic-btn');
  const wakeWordBtn = document.getElementById('wake-word-btn');
  const visionBtn = document.getElementById('vision-btn');
  const imageUpload = document.getElementById('image-upload');
  const userInput = document.getElementById('user-input');
  const terminalToggle = document.getElementById('terminal-toggle');
  const terminalDrawer = document.getElementById('terminal-drawer');
  const terminalClose = document.getElementById('terminal-close');
  const terminalClear = document.getElementById('terminal-clear');
  const actionChips = document.querySelectorAll('.action-chip');

  if (!sendBtn || !userInput) return;

  const processUserQuery = async (text) => {
    if (!text || state.isThinking) return;

    appendMessage('user', text);
    userInput.value = '';
    state.isThinking = true;
    ArcReactor.setState('thinking', 'PROCESSING...');

    try {
      const response = await callGeminiAPI(text, state.attachedImageBase64, state.history);
      
      state.history.push({ role: 'user', text });
      state.history.push({ role: 'model', text: response });

      appendMessage('jarvis', response);

      if (state.attachedImageBase64) {
        state.attachedImageBase64 = null;
        if (visionBtn) visionBtn.style.color = '';
      }

      ArcReactor.setState('speaking', 'SPEAKING...');
      SpeechManager.speak(
        response,
        () => { ArcReactor.setState('speaking', 'SPEAKING...'); },
        () => { 
          ArcReactor.setState('idle', 'ONLINE'); 
          if (state.continuousModeActive && wakeWordBtn) {
            triggerWakeWordMode();
          }
        }
      );

    } catch (err) {
      TerminalLogger.log(`Execution Error: ${err.message}`, 'error');
      appendMessage('system', `Error: ${err.message}`);
      ArcReactor.setState('idle', 'ERROR');
    } finally {
      state.isThinking = false;
    }
  };

  sendBtn.addEventListener('click', () => processUserQuery(userInput.value.trim()));
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') processUserQuery(userInput.value.trim());
  });

  if (visionBtn && imageUpload) {
    visionBtn.addEventListener('click', () => imageUpload.click());
    imageUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        state.attachedImageBase64 = uploadEvent.target.result;
        visionBtn.style.color = '#00f3ff';
        TerminalLogger.log('Screenshot loaded into memory buffer.', 'success');
        appendMessage('system', 'Screenshot attached. Ready for analysis.');
      };
      reader.readAsDataURL(file);
    });
  }

  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (state.isThinking) return;

      if (SpeechManager.isListening && !state.continuousModeActive) {
        SpeechManager.stopListening();
        ArcReactor.setState('idle', 'ONLINE');
        return;
      }

      ArcReactor.setState('listening', 'LISTENING...');
      SpeechManager.startListening(
        (transcriptData) => {
          const spokenText = transcriptData.final || transcriptData.interim;
          userInput.value = spokenText;
          if (transcriptData.final) {
            SpeechManager.stopListening();
            processUserQuery(transcriptData.final);
          }
        },
        (err) => {
          TerminalLogger.log(`Speech Recognition Error: ${err}`, 'warn');
          ArcReactor.setState('idle', 'ONLINE');
        }
      );
    });
  }

  const triggerWakeWordMode = () => {
    state.continuousModeActive = true;
    wakeWordBtn.style.color = '#10b981';
    ArcReactor.setState('listening', 'STANDBY (WAKE WORD)');
    
    SpeechManager.startContinuousListening(
      (commandText) => {
        if (commandText) {
          userInput.value = commandText;
          processUserQuery(commandText);
        } else {
          ArcReactor.setState('listening', 'LISTENING FOR COMMAND...');
        }
        setTimeout(() => {
          SpeechManager.activeCommandCaptured = false;
        }, 3000);
      },
      (err) => { TerminalLogger.log(`Continuous listening error: ${err}`, 'warn'); }
    );
  };

  if (wakeWordBtn) {
    wakeWordBtn.addEventListener('click', () => {
      state.continuousModeActive = !state.continuousModeActive;
      if (state.continuousModeActive) {
        triggerWakeWordMode();
      } else {
        wakeWordBtn.style.color = '';
        SpeechManager.stopListening();
        ArcReactor.setState('idle', 'ONLINE');
      }
    });
  }

  actionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const actionType = chip.getAttribute('data-action');
      QuickActions.handleAction(actionType, (queryText) => {
        userInput.value = queryText;
        processUserQuery(queryText);
      });
    });
  });

  if (terminalToggle && terminalDrawer) {
    terminalToggle.addEventListener('click', () => terminalDrawer.classList.toggle('open'));
    terminalClose.addEventListener('click', () => terminalDrawer.classList.remove('open'));
    terminalClear.addEventListener('click', () => TerminalLogger.clear());
  }
});

function appendMessage(sender, text) {
  const chatOutput = document.getElementById('chat-output');
  if (!chatOutput) return;
  
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}-message`;
  msgDiv.textContent = text;
  chatOutput.appendChild(msgDiv);
  chatOutput.scrollTop = chatOutput.scrollHeight;
}
