'use strict';

const sentiment = require('sentiment');

module.exports.analyzeNote = (event) => {
  const note = event.Records[0].Sns.Message;
  const result = sentiment(note);
  if (result.score > 2) {
    console.log(`Positive note - will be published: ${note}`);
  } else {
    console.log(`Negative note - won't be published: ${note}`);
  }
};
