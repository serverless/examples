const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

export const webhook = async (event) => {
  const body = JSON.parse(event.body);
  const { message } = body;
  const chatId = message.chat.id;

  await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message.text, chat_id: chatId }),
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
    }),
  };
};
