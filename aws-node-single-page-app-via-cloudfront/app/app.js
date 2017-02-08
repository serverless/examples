/* eslint-env browser */
/* eslint-disable no-var */

// Renders the page based on the current URL
function renderApp() {
  var content;
  var main;

  if (window.location.pathname === '/about') {
    content = '<div>Welcome to the About page</div>';
  } else if (window.location.pathname === '/') {
    content = '<div>Welcome Serverless Developer :)</div>';
  }

  main = document.getElementsByTagName('main')[0];
  main.innerHTML = content;
}

// Navigate to another URL and re-render the application
function navigate(evt) {
  var href;

  evt.preventDefault();
  href = evt.target.getAttribute('href');
  window.history.pushState({}, undefined, href);
  renderApp();
}

function render(/* event */) {
  // Attach the event listener once the DOM has been loaded
  var nav = document.getElementsByTagName('nav')[0];
  nav.addEventListener('click', navigate, false);

  // First initial App rendering
  renderApp();
}

document.addEventListener('DOMContentLoaded', render);
