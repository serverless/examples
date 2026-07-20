import Sentiment from 'sentiment';

const sentiment = new Sentiment();

export const analyzeNote = (event) => {
  const note = event.Records[0].Sns.Message;
  const result = sentiment.analyze(note);
  if (result.score > 2) {
    console.log(`Positive note - will be published: ${note}`);
  } else {
    console.log(`Negative note - won't be published: ${note}`);
  }
};
