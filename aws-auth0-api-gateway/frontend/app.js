/* global window document localStorage fetch alert */
const AUTH0_CLIENT_ID = 'CehMUDo0ktxXX7ic6ILeSGybDn95sZyO';
const AUTH0_DOMAIN = 'reviewgen.auth0.com';
const AUTH0_CALLBACK_URL = window.location.href; // eslint-disable-line
const PUBLIC_ENDPOINT = 'https://zs5nh6l2wl.execute-api.us-east-1.amazonaws.com/dev/api/public';
const PRIVATE_ENDPOINT = 'https://zs5nh6l2wl.execute-api.us-east-1.amazonaws.com/dev/api/private';

// initialize auth0 lock
const lock = new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN); // eslint-disable-line

const jwtToken = localStorage.getItem('userToken');
if (jwtToken) {
  document.getElementById('btn-login').style.display = 'none';
  document.getElementById('btn-logout').style.display = 'inline';
  const profile = JSON.parse(localStorage.getItem('profile'));
  document.getElementById('nick').textContent = profile.nickname;
}

// Handle login
document.getElementById('btn-login').addEventListener('click', () => {
  lock.show((err, profile, token) => {
    if (err) {
      // Error callback
      console.error('Something went wrong: ', err); // eslint-disable-line no-console
      alert('Something went wrong, check the Console errors'); // eslint-disable-line no-alert
    } else {
      // Success calback
      console.log(token); // eslint-disable-line no-console

      // Save the JWT token.
      localStorage.setItem('userToken', token);

      // Save the profile
      localStorage.setItem('profile', JSON.stringify(profile));

      document.getElementById('btn-login').style.display = 'none';
      document.getElementById('btn-logout').style.display = 'inline';
      document.getElementById('nick').textContent = profile.nickname;
    }
  });
});

// Handle logout
document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('profile');
  document.getElementById('btn-login').style.display = 'inline';
  document.getElementById('btn-logout').style.display = 'none';
});

// Handle public api call
document.getElementById('btn-public').addEventListener('click', () => {
  // call public API
  const getdata = fetch(PUBLIC_ENDPOINT, {
    method: 'GET',
    cache: false,
  });

  getdata.then((response) => {
    response.json().then((data) => {
      console.log('Message:', data); // eslint-disable-line no-console
      document.getElementById('message').textContent = '';
      document.getElementById('message').textContent = data.message;
    });
  });
});

// Handle private api call
document.getElementById('btn-private').addEventListener('click', () => {
  // Call private API with JWT in header
  const getdata = fetch(PRIVATE_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('userToken')}`,
    },
    method: 'GET',
    cache: false,
  });

  getdata.then((response) => {
    response.json().then((data) => {
      console.log('Token:', data); // eslint-disable-line no-console
      document.getElementById('message').textContent = '';
      document.getElementById('message').textContent = data.message;
    });
  });
});
