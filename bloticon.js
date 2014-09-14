/*global chrome hashblot blotpw*/
(function(){
  // until http://crbug.com/29683 is fixed, we need to generate ImageData
  // to set the icon for a page action
  var iconSize = 19;
  var scales = [1,2];
  var maxDimension = Math.max.apply(null,scales) * iconSize;
  var iconCanvas = document.createElement('canvas');
    iconCanvas.width = maxDimension; iconCanvas.height = maxDimension;
  var icCtx = iconCanvas.getContext('2d');

  // Returns a dictionary of ImageData for the hashblot at scales.
  function hashblotImageData(str, style) {

    var dict = {};
    scales.forEach(function(scale) {
      var renderSize = iconSize * scale;
      // Scale factor between 0-255 coordinate space and icon space
      var blotScale = (renderSize-scale*2)/255;

      icCtx.fillStyle = '#bbb';
      icCtx.fillRect(0, 0, renderSize, renderSize);
      icCtx.save();
      // within a 1px border
      icCtx.translate(scale, scale);
      // Scale to blot scale
      icCtx.scale(blotScale, blotScale);
      // Fill the background
      icCtx.fillStyle = '#fff';
      icCtx.fillRect(0, 0, 255, 255);
      // Draw the blot
      icCtx.fillStyle = style;
      icCtx.beginPath();
      hashblot.sha1qpath2d(str,icCtx);
      icCtx.fill();
      // Render the icon at this scale
      icCtx.restore();
      dict[renderSize] = icCtx.getImageData(0, 0, renderSize, renderSize);
    });
    return dict;
  }

  function updateTabIcon(tab) {
    var hostname = blotpw.getHostnameFromUrl(tab.url);
    if (hostname) {
      blotpw.getDomainAndInfo(hostname, function(err, info) {
        var blotStr = blotpw.blotString({
          domain: info.domain,
          email: info.record ? info.record.email
            : info.defaults && info.defaults.email,
          salt: info.record ? info.record.salt
            : info.defaults && info.defaults.salt
        });
        chrome.pageAction.setIcon({
          tabId: tab.id,
          imageData: hashblotImageData(blotStr,
            info.record ? '#000' : '#888')
        });
        chrome.pageAction.setTitle({
          tabId: tab.id,
          title: 'blot.pw [' + blotStr + ']'
        });
        chrome.pageAction.show(tab.id);
      });
    }
  }
  window.bloticon = {updateTabIcon: updateTabIcon};
})();
