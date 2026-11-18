export const ArcReactor = {
  element: null,
  statusLabel: null,

  init(containerId = 'arc-reactor', labelId = 'status-label') {
    this.element = document.getElementById(containerId);
    this.statusLabel = document.getElementById(labelId);
  },

  setState(state, customText = null) {
    if (!this.element) return;
    this.element.classList.remove('listening', 'thinking', 'speaking');
    let defaultText = 'STANDBY';

    switch (state) {
      case 'listening':
        this.element.classList.add('listening');
        defaultText = 'LISTENING...';
        break;
      case 'thinking':
        this.element.classList.add('thinking');
        defaultText = 'PROCESSING...';
        break;
      case 'speaking':
        this.element.classList.add('speaking');
        defaultText = 'SPEAKING...';
        break;
      case 'idle':
      default:
        defaultText = 'ONLINE';
        break;
    }

    if (this.statusLabel) {
      this.statusLabel.textContent = customText || defaultText;
    }
  }
};
