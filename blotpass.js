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

  function getHostnameFromUrl(url) {
    return urlIsHttp(url) ? getHostname(url) : null;
  }

  function getDomainProfiles(cb) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      return cb(null, JSON.parse(xhr.responseText));
    };
    xhr.open("GET", "/domainprofiles.json", true);
    xhr.send();
  }

  function blotString(info) {
    var base = info.domain;
    if (info.email) base = info.email + ' ' + base;
    if (info.salt) base = base + ' ' + info.salt;
    return base;
  }

  function getLocalNamespaces(namespaces,cb) {
    return chrome.storage.local.get(null, function(items) {
      var results = {};
      namespaces.forEach(function(namespace) {
        results[namespace] = {};
      });
      Object.keys(items).forEach(function (key) {
        namespaces.forEach(function(namespace) {
          var prefix = namespace + '.';
          if (key.slice(0,prefix.length) == prefix) {
            results[namespace][key.slice(prefix.length)] = items[key];
          }
        });
      });
      return cb(null, results);
    });
  }

  function getDefaults(cb){
    getLocalNamespaces(['defaults'], function(err,res) {
      return cb(err,res.defaults);
    });
  }

  function getDomainAndInfo(hostname, cb) {
    var components = hostname.split('.');
    queue()
      .defer(getDomainProfiles)
      .defer(getLocalNamespaces, ['records', 'defaults'])
      .await(function(err, profiles, local) {
        var records = local.records;
        var i = 0;
        // For every level of the domain by specificity
        while (i < components.length) {
          var domain = components.slice(i, components.length).join('.');

          // If there is a profile or record for this domain
          if (profiles[domain] || records[domain]) {
            return cb(null,{
              domain: domain,
              profile: profiles[domain],
              record: records[domain],
              defaults: local.defaults
            });
          }

          ++i;
        }
        // if no profile or record found
        return cb(null,{
          domain:
            // strip 'www' prefix, if present
            // check lastIndexOf because if www appears multiple times in
            // the components, something freaky is going on, and we're not
            // going to touch that
            components.lastIndexOf('www') == 0 ? components.slice(1).join('.')
              : hostname,
          defaults: local.defaults
        });
      });
  }

  window.blotpass = {
    blotString: blotString,
    getHostnameFromUrl: getHostnameFromUrl,
    getDomainAndInfo: getDomainAndInfo,
    getDefaults: getDefaults
  };
})();
