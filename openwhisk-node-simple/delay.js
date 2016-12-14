function delay() {
  return new Promise(resolve =>
    setTimeout(() => resolve({ done: true }), 2000),
  );
}

exports.handler = delay;
