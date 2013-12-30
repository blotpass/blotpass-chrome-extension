/*global chrome hashblot blotpw*/

// until http://crbug.com/29683 is fixed, we need to generate ImageData
// to set the icon for a page action
var iconSize = 19;
var scales = [1,2];
var maxDimension = Math.max.apply(null,scales) * iconSize;
var svgImg = document.createElement('img');
var iconCanvas = document.createElement('canvas');
  iconCanvas.width = maxDimension; iconCanvas.height = maxDimension;
var icCtx = iconCanvas.getContext('2d');

// Returns a dictionary of ImageData for the hashblot at scales.
function hashblotImageData(str, style) {
  svgImg.src = 'data:image/svg+xml,' +
    '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" ' +
    'viewBox="-1 -1 257 257"><path d="' + hashblot.sha1qp(str) + '" ' +
    'style="fill-rule:nonzero;' + (style || '') + '"/></svg>';

  var dict = {};
  scales.forEach(function(scale) {
    var renderSize = iconSize * scale;
    icCtx.clearRect(0, 0, renderSize, renderSize);
    icCtx.drawImage(svgImg, 0, 0, renderSize, renderSize);
    dict[renderSize] = icCtx.getImageData(0, 0, renderSize, renderSize);
  });
  return dict;
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    var hostname = blotpw.getHostnameFromUrl(changeInfo.url);
    if (hostname) {
      blotpw.getDomainAndInfo(hostname, function(err, info) {
        var email = info.record ? info.record.email
          : info.defaults && info.defaults.email;
        var salt = info.record ? info.record.salt
          : info.defaults && info.defaults.salt;
        chrome.pageAction.setIcon({
          tabId: tabId,
          imageData: hashblotImageData(blotpw.blotString({
            domain: info.domain, email: email, salt: salt}),
            info.record ? '' : 'fill:#888')
        });
        chrome.pageAction.show(tabId);
      });
    }
  }
});
