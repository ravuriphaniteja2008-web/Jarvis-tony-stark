export const QuickActions = {
  handleAction(actionType, processQueryCallback) {
    switch (actionType) {
      case 'weather':
        processQueryCallback("What is the current weather conditions and forecast in Guntur, Andhra Pradesh?");
        break;
      case 'cricket':
        processQueryCallback("Give me the latest live cricket scores and recent match updates for Sunrisers Hyderabad or current international matches.");
        break;
      case 'search':
        const query = prompt("Enter search query:");
        if (query) {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        }
        break;
      case 'time':
        const timeStr = new Date().toLocaleTimeString();
        processQueryCallback(`The local system time is ${timeStr}. Confirm time status.`);
        break;
      default:
        break;
    }
  }
};
