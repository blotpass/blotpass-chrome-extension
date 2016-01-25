/*global chrome fetch*/
"use strict";
(function(){
  function getHostname(url) {
    let a = document.createElement('a');
    a.href = url;
    return a.hostname;
  }

  // Returns whether or not a URL is either HTTP or HTTPS.
  function urlIsHttp(url) {
    let a = document.createElement('a');
    a.href = url;
    return a.protocol == 'http:' || a.protocol == 'https:' ;
  }

  function getHostnameFromUrl(url) {
    return urlIsHttp(url) ? getHostname(url) : null;
  }

  function getDomainProfiles() {
    return fetch('/domainprofiles.json').then(res => res.json());
  }

  function blotString(info) {
    let base = info.domain;
    if (info.email) base = info.email + ' ' + base;
    if (info.salt) base = base + ' ' + info.salt;
    return base;
  }

  function getLocalNamespaces(namespaces){
    return new Promise((resolve, reject) => {
      return chrome.storage.local.get(null, items => {
        let results = {};
        namespaces.forEach(namespace => results[namespace] = {});
        Object.keys(items).forEach(key => {
          namespaces.forEach(namespace => {
            let prefix = namespace + '.';
            if (key.slice(0, prefix.length) == prefix) {
              results[namespace][key.slice(prefix.length)] = items[key];
            }
          });
        });
        return resolve(results);
      });
    });
  }

  function getDefaults() {
    return getLocalNamespaces(['defaults']).then(local => local.defaults);
  }

  function getDomainAndInfo(hostname, cb) {
    let components = hostname.split('.');
    return Promise.all([
      getDomainProfiles(),
      getLocalNamespaces(['records', 'defaults'])
      ]).then(results => {
        let profiles = results[0];
        let local = results[1];
        let records = local.records;
        let i = 0;
        // For every level of the domain by specificity
        while (i < components.length) {
          let domain = components.slice(i, components.length).join('.');

          // If there is a profile or record for this domain
          if (profiles[domain] || records[domain]) {
            return {
              domain: domain,
              profile: profiles[domain],
              record: records[domain],
              defaults: local.defaults
            };
          }

          ++i;
        }
        // if no profile or record found
        return {
          domain:
            // strip 'www' prefix, if present
            // check lastIndexOf because if www appears multiple times in
            // the components, something freaky is going on, and we're not
            // going to touch that
            components.lastIndexOf('www') == 0 ? components.slice(1).join('.')
              : hostname,
          defaults: local.defaults
        };
      });
  }

  window.blotpass = {
    blotString: blotString,
    getHostnameFromUrl: getHostnameFromUrl,
    getDomainAndInfo: getDomainAndInfo,
    getDefaults: getDefaults
  };
})();
