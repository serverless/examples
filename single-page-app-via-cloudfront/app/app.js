/* eslint-disable */

// Renders the page based on the current URL
function renderApp() {
  var content;
  if (window.location.pathname === '/about') {
    content = '<div>Welcome to the About page</div>'
  } else if (window.location.pathname === '/') {
    content = '<div>Welcome Serverless Developer :)</div>'
  }

  var main = document.getElementsByTagName('main')[0];
  main.innerHTML = content;
}

// Navigate to another URL and re-render the application
function navigate(evt) {
  evt.preventDefault();
  var href = evt.target.getAttribute('href');
  window.history.pushState({}, undefined, href);
  renderApp();
}

document.addEventListener('DOMContentLoaded', function(event) {
  // Attach the event listener once the DOM has been loaded
  var nav = document.getElementsByTagName('nav')[0];
  nav.addEventListener("click", navigate, false);

  // First initial App rendering
  renderApp();
});
