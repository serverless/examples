/* global window document localStorage fetch alert */

// Fill in with your values
const AUTH0_CLIENT_ID = 'your-auth0-client-id-here';
const AUTH0_DOMAIN = 'your-auth0-domain-here.auth0.com';
const AUTH0_CALLBACK_URL = window.location.href; // eslint-disable-line
const PUBLIC_ENDPOINT = 'https://your-aws-endpoint-here.amazonaws.com/dev/api/public';
const PRIVATE_ENDPOINT = 'https://your-aws-endpoint-here.us-east-1.amazonaws.com/dev/api/private';

// initialize auth0 lock
const lock = new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, {
  auth: {
    params: {
      scope: 'openid email'
    }
  }
})

// Handle login
lock.on("authenticated", function(authResult) {
  console.log(authResult)
  lock.getProfile(authResult.idToken, function(error, profile) {
    if (error) {
      // Handle error
      alert(JSON.stringify(error))
      return false
    }
    // authResult.accessToken && authResult.idToken
    // Save the JWT token.
    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('id_token', authResult.idToken)

    // Save the profile
    localStorage.setItem('profile', JSON.stringify(profile))

    updateUI()
  });
});

function updateUI() {
  const isLoggedIn = localStorage.getItem('id_token')
  if (isLoggedIn) {
    // swap buttons
    document.getElementById('btn-login').style.display = 'none'
    document.getElementById('btn-logout').style.display = 'inline'
    const profile = JSON.parse(localStorage.getItem('profile'))
    // show username
    document.getElementById('nick').textContent = profile.nickname
  }
}

updateUI()

// Handle login
document.getElementById('btn-login').addEventListener('click', () => {
  lock.show()
})

// Handle logout
document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('id_token')
  localStorage.removeItem('access_token')
  localStorage.removeItem('profile')
  document.getElementById('btn-login').style.display = 'flex'
  document.getElementById('btn-logout').style.display = 'none'
  document.getElementById('nick').textContent = ''
})

// Handle public api call
document.getElementById('btn-public').addEventListener('click', () => {
  // call public API
  fetch(PUBLIC_ENDPOINT, {
    cache: 'no-store',
    method: 'POST',
  })
  .then(response => response.json())
  .then((data) => {
    console.log('Message:', data)
    document.getElementById('message').textContent = ''
    document.getElementById('message').textContent = data.message
  }).catch((e) => {
    console.log('error', e)
  })
})

// Handle private api call
document.getElementById('btn-private').addEventListener('click', () => {
  // Call private API with JWT in header
  const token = localStorage.getItem('id_token')
  /*
   // block request from happening if no JWT token present
   if (!token) {
    document.getElementById('message').textContent = ''
    document.getElementById('message').textContent = 'You must login to call this protected endpoint!'
    return false
  }*/
  // Do request to private endpoint
  fetch(PRIVATE_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then((data) => {
    console.log('Token:', data)
    document.getElementById('message').textContent = ''
    document.getElementById('message').textContent = data.message
  }).catch((e) => {
    console.log('error', e)
  })
})
