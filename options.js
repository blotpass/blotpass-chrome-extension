/*global chrome blotpass*/
"use strict";
{

function init() {
  blotpass.getDefaults().then(defaults => {
    document.getElementById('email').value = defaults.email || '';
    document.getElementById('salt').value = defaults.salt || '';
  });
}

function save() {
  chrome.storage.local.set({
    'defaults.email': document.getElementById('email').value,
    'defaults.salt': document.getElementById('salt').value
  });
}

init();

document.getElementById('save').addEventListener('click', save);
}
