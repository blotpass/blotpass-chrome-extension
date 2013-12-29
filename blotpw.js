/*global chrome queue*/
(function(){
function getHostname(url) {
  var a = document.createElement('a');
  a.href = url;
  return a.hostname;
}

// Returns whether or not a URL is either HTTP or HTTPS.
function urlIsHttp(url) {
  var a = document.createElement('a');
  a.href = url;
  return a.protocol == 'http:' || a.protocol == 'https:' ;
}

function getDomainProfiles(cb) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    return cb(null,JSON.parse(xhr.responseText));
  };
  xhr.open("GET","/domainprofiles.json",true);
  xhr.send();
}

function getLocalRecords(cb) {
  return chrome.storage.local.get(null, function(items) {
    var records = Object.create(null);
    Object.keys(items).forEach(function (key) {
      if (key.slice(0,9) == 'profiles/') {
        records[key.slice(9)] = items.key;
      }
    });
    return cb(null, records);
  });
}

function getDomainAndInfo(url, cb) {
  if (urlIsHttp(url)){
    var hostname = getHostname(url);
    var components = hostname.split('.');
    queue()
      .defer(getDomainProfiles)
      .defer(getLocalRecords)
      .await(function(err, profiles, records){
        var i = 0;
        // For every level of the domain by specificity
        while (i < components.length) {
          var domain = components.slice(i, components.length).join('.');

          // If there is a profile or record for this domain
          if (profiles[domain] || records[domain]) {
            return cb({
              domain: domain,
              profile: profiles[domain],
              record: records[domain]
            });
          }
        }
        // if no profile or record found
        return cb({
          domain:
            // strip 'www' components
            components[0] == 'www' ? components.slice(1).join('.')
              : hostname
        });
      });
  } else {
    return cb({});
  }
}
window.blotpw = {getDomainAndInfo: getDomainAndInfo};
})();