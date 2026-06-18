export async function sendTelegramMessage({ token, chatId, text }) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram sendMessage failed: ${response.status} ${body}`);
  }
}

export function formatTelegramNotification(message) {
  if (!message.text) {
    return [
      '📩 Новое сообщение (вложение)',
      '',
      `Чат: ${message.chatTitle}`,
      '',
      `От: ${message.author || 'неизвестно'}`,
      '',
      `Время: ${message.time || new Date().toLocaleString('ru-RU')}`
    ].join('\n');
  }

  return [
    '📩 Новое сообщение',
    '',
    `Чат: ${message.chatTitle}`,
    '',
    `От: ${message.author || 'неизвестно'}`,
    '',
    'Текст:',
    message.text,
    '',
    `Время: ${message.time || new Date().toLocaleString('ru-RU')}`
  ].join('\n');
}
