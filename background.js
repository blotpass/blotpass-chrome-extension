/*global chrome bloticon*/

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  bloticon.updateTabIcon(tab);
});

// Update all tabs on startup
chrome.runtime.onInstalled.addListener(function() {
  chrome.tabs.query({url: '*://*/*'},
    function (tabs) {
      for (var i = 0; i < tabs.length; ++i) {
        bloticon.updateTabIcon(tabs[i]);
      }
    });
});
