/*global chrome hashblot blotpw*/

// until http://crbug.com/29683 is fixed, we need to generate ImageData
// to set the icon for a page action
var renderSize = 76;
var svgImg = document.createElement('img');
var iconCanvas = document.createElement('canvas');
  iconCanvas.width = renderSize; iconCanvas.height = renderSize;
var icCtx = iconCanvas.getContext('2d');

function hashblotImageData(str, style) {
    svgImg.src='data:image/svg+xml,' +
      '<svg xmlns=http://www.w3.org/2000/svg" version="1.1" ' +
      'viewBox="-1 -1 257 257"><path d="' + hashblot.sha1qp(str) + '" ' +
      'style="fill-rule:nonzero;' + (style || '') + '"/></svg>';

    icCtx.clearRect(0, 0, renderSize, renderSize);
    icCtx.drawImage(svgImg, 0, 0, renderSize, renderSize);
    return icCtx.getImageData(0, 0, renderSize, renderSize);
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    var hostname = blotpw.getHostnameFromUrl(changeInfo.url);
    if (hostname) {
      blotpw.getDomainAndInfo(hostname, function(info) {
        var email = info.record ? info.record.email
          : info.defaults && info.defaults.email;
        var salt = info.record ? info.record.salt
          : info.defaults && info.defaults.salt;
        chrome.pageAction.setIcon({
          tabId: tabId,
          imageData: hashblotImageData(blotpw.blotString({
            domain: info.domain, email: email, salt: salt}),
            info.record ? '' : 'fill:none;stroke:black')
        });
        chrome.pageAction.show(tabId);
      });
    }
  }
});
