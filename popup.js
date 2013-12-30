/*global chrome hashblot queue blotpw*/

function updateFromPhrase(phrase) {
  document.getElementById('blotpath').setAttribute('d',
    phrase ? hashblot.sha1qp(phrase) : '');
}

function calculateHashblot() {
  updateFromPhrase(blotpw.blotString({
    email: document.getElementById('email').value,
    domain: document.getElementById('domain').value,
    salt: document.getElementById('salt').value}));
}

var currentInfo;

function loadInfo() {
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    var currentUrl = tabs[0].url;
    blotpw.getDomainAndInfo(currentUrl, function(err,info) {
      currentInfo = info;
      setStateFromCurrentInfo();
    });
  });
}

function getResultsFromInfo(info) {
  return {
    domain: info.domain,
    email: info.record ? info.record.email
      : info.defaults && info.defaults.email,
    salt: info.record ? info.record.salt
      : info.defaults && info.defaults.salt,
    memo: info.record && info.record.memo
  };
}

function setStateFromCurrentInfo() {
  var info = getResultsFromInfo(currentInfo);
  document.getElementById('domain').value = info.domain;
  document.getElementById('domainname').textContent = info.domain;
  document.getElementById('email').value = info.email;
  document.getElementById('salt').value = info.salt;
  document.getElementById('memo').value = info.memo;
  calculateHashblot();
  setDomainProfileInfo();
  updateDisplayState();
}

function setDomainProfileInfo() {
  //TODO: Populate info about this domain
}

function showOnlyChild(parentId, childId) {
  var children = document.getElementById(parentId).children;
  for (var i = 0; i < children.length; i++) {
    children[i].style.display = children[i].id == childId ? '' : 'none';
  }
}

function updateDisplayState() {
  var formDomain = document.getElementById('domain').value;
  var formEmail = document.getElementById('email').value;
  var formSalt = document.getElementById('salt').value;
  var formMemo = document.getElementById('memo').value;

  if (currentInfo.record) {

    if (formDomain == currentInfo.domain
      && formEmail == currentInfo.record.email
      && formSalt == currentInfo.record.salt) {

        if (formMemo == currentInfo.record.memo) {

          showOnlyChild('finishers', 'record-untouched');

        } else if (formMemo == '' && formEmail == currentInfo.defaults.email
          && formSalt == currentInfo.defaults.salt ) {

          // Technically, this could be a record of note if the domain
          // is not the domain that would be found by default for this URL.
          // However, I just do not feel like considering that case.
          showOnlyChild('finishers', 'record-blanked');

        } else {

          showOnlyChild('finishers', 'record-edited');
        }
    } else {

      showOnlyChild('finishers', 'record-changed');
    }
  } else {

    if (formEmail != currentInfo.defaults.email
      || formSalt != currentInfo.defaults.salt
      || formMemo) {

      showOnlyChild('finishers', 'norecord-edited');

    } else {

      showOnlyChild('finishers', 'norecord-untouched');
    }
  }
}

function saveRecord() {
  var newDomain = document.getElementById('domain').value;
  // TODO: alert if new record won't match the current domain
  var newRecord = {
    email: document.getElementById('email').value,
    salt: document.getElementById('salt').value,
    memo: document.getElementById('memo').value
  };
  var newItems = {};
  newItems['records.' + newDomain] = newRecord;
  chrome.storage.local.set(newItems,function(){
    // If the domain is changing
    if (currentInfo.domain != newDomain) {
      // Delete the record for the old domain and re-retrieve the new info
      deleteRecord();
    } else {
      currentInfo.record = newRecord;
      updateDisplayState();
    }
  });
}

function updateDisplayStateAndBlot() {
  calculateHashblot();
  updateDisplayState();
}

function deleteRecord() {
  chrome.storage.local.remove(['records.' + currentInfo.domain], function(){
    // load info for whatever the relevant domain is now
    loadInfo();
  });
}

function editDomain() {
  showOnlyChild('domaininfo', 'domain-input');
  document.getElementById('domain-input').setSelectionRange(0,0);
  document.getElementById('domain-input').focus();
}

// This is a bit of a mouthful - basically, it's for all the things that
// should happen after an "action", namely "finalizing" the domain name
// (hiding the input and displaying the "edit" button).
function snapToPostActionState() {
  showOnlyChild('domaininfo', 'domain-fixed');
}

function revertState() {
  setStateFromCurrentInfo();
  snapToPostActionState();
}

function closePopup() {
  window.close();
}

function hookupListeners() {
  // Get Element By ID, Add Event Listener
  function gebidael(id,event,listener){
    document.getElementById(id).addEventListener(event, listener);
  }

  gebidael('domain-input', 'keyup', updateDisplayStateAndBlot);
  gebidael('email', 'keyup', updateDisplayStateAndBlot);
  gebidael('salt', 'keyup', updateDisplayStateAndBlot);
  gebidael('memo', 'keyup', updateDisplayState);

  gebidael('domainedit', 'click', editDomain);

  gebidael('ok-dismiss', 'click', closePopup);
  gebidael('save-new', 'click', saveRecord);
  gebidael('cancel-new', 'click', closePopup);
  gebidael('ok-record', 'click', closePopup);
  gebidael('delete-record', 'click', deleteRecord);
  gebidael('save-edit', 'click', saveRecord);
  gebidael('cancel-edit', 'click', revertState);
  gebidael('save-blank', 'click', deleteRecord);
  gebidael('cancel-blank', 'click', revertState);
  gebidael('save-change', 'click', saveRecord);
  gebidael('cancel-change', 'click', revertState);
}

hookupListeners();
loadInfo();
