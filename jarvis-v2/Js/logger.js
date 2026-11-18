export const TerminalLogger = {
  bodyElement: null,

  init(bodyId = 'terminal-body') {
    this.bodyElement = document.getElementById(bodyId);
  },

  log(message, type = 'info') {
    if (!this.bodyElement) return;
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[${timestamp}] ${message}`;
    this.bodyElement.appendChild(entry);
    this.bodyElement.scrollTop = this.bodyElement.scrollHeight;
  },

  clear() {
    if (this.bodyElement) this.bodyElement.innerHTML = '';
    this.log('Terminal buffer cleared.', 'info');
  }
};
