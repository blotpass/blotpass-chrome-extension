/*global chrome hashblot*/

function updateFromPhrase(phrase) {
  document.getElementById('blotpath').setAttribute('d',
    phrase ? hashblot.sha1qp(phrase) : '');
}

function calculateHashblot() {
  var email = document.getElementById('email').value;
  var domain = document.getElementById('domain').value;
  var salt = document.getElementById('salt').value;
  
  updateFromPhrase(email + ' ' + domain + (salt ? ' ' + salt : ''));
}

