/*global chrome hashblot blotpw bloticon*/

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  bloticon.updateTabIcon(tab);
});
