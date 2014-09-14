/*global chrome hashblot blotpw*/
(function(){
  // until http://crbug.com/29683 is fixed, we need to generate ImageData
  // to set the icon for a page action
  var iconSize = 19;
  var scales = [1,2];
  var maxDimension = Math.max.apply(null,scales) * iconSize;
  var svgImg = document.createElement('img');
    svgImg.width = maxDimension; svgImg.height = maxDimension;
  var iconCanvas = document.createElement('canvas');
    iconCanvas.width = maxDimension; iconCanvas.height = maxDimension;
  var icCtx = iconCanvas.getContext('2d');

  // Returns a dictionary of ImageData for the hashblot at scales.
  function hashblotImageData(str, style) {

    // Size of 1 native px in SVG's coordinate space
    var px = 258/iconSize;

    svgImg.src = 'data:image/svg+xml,' +
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" ' +
        'viewBox="'+(-px)+' '+(-px)+' '+(px*2+256)+' '+(px*2+256)+'" ' +
        'width="'+maxDimension+'" height="'+maxDimension+'" >' +
      '<rect x="'+(-px/2)+'" y="'+(-px/2)+'" '+
        'height="'+(px+256)+'" width="'+(px+256)+'" '+
        'style="fill: #fff; stroke: #bbb; stroke-width: '+px+';" />' +
      '<path d="' + hashblot.sha1qp(str) + '" ' +
        'style="fill-rule:nonzero;' + (style || '') + '" /></svg>';

    var dict = {};
    scales.forEach(function(scale) {
      var renderSize = iconSize * scale;
      icCtx.clearRect(0, 0, renderSize, renderSize);
      icCtx.drawImage(svgImg, 0, 0, renderSize, renderSize);
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
            info.record ? '' : 'fill:#888')
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
