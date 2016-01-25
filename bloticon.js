/*global chrome hashblot blotpass*/
{
  "use strict";
  // until http://crbug.com/29683 is fixed, we need to generate ImageData
  // to set the icon for a page action
  let iconSize = 19;
  let scales = [1,2];
  let maxDimension = Math.max.apply(null,scales) * iconSize;
  let iconCanvas = document.createElement('canvas');
    iconCanvas.width = maxDimension; iconCanvas.height = maxDimension;
  let icCtx = iconCanvas.getContext('2d');

  // Returns a dictionary of ImageData for the hashblot at scales.
  let hashblotImageData = (str, style) => {

    let dict = {};
    scales.forEach(function(scale) {
      let renderSize = iconSize * scale;
      // Scale factor between 0-255 coordinate space and icon space
      let blotScale = (renderSize-scale*2)/255;

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
  };

  let updateTabIcon = (tab) => {
    let hostname = blotpass.getHostnameFromUrl(tab.url);
    if (hostname) {
      blotpass.getDomainAndInfo(hostname).then(info => {
        let blotStr = blotpass.blotString({
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
          title: 'Blotpass [' + blotStr + ']'
        });
        chrome.pageAction.show(tab.id);
      });
    }
  };

  window.bloticon = {updateTabIcon: updateTabIcon};
}
