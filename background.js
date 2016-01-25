/*global chrome bloticon*/
{
  "use strict";
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    bloticon.updateTabIcon(tab);
  });

  // Update all tabs on startup
  chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({url: '*://*/*'}, (tabs) => {
      for (let i = 0; i < tabs.length; ++i) {
        bloticon.updateTabIcon(tabs[i]);
      }
    });
  });

}