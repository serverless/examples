const leftPad = require('left-pad');

function padlines(args) {
  const lines = args.lines || [];
  return { padded: lines.map(l => leftPad(l, 30, '.')) };
}

exports.handler = padlines;
