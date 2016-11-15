'use strict';

const sentiment = require('sentiment');

module.exports.analyzeNote = (event) => {
  const note = event.Records[0].Sns.Message;
  const result = sentiment(note);
  if (result.score > 2) {
    // eslint-disable-next-line no-console
    console.log(`Positive note - will be published: ${note}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`Negative note - won't be published: ${note}`);
  }
};
