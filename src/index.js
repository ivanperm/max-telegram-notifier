import { config, assertRuntimeConfig } from './config.js';
import { openBrowserContext, getOrCreatePage } from './browser.js';
import { loadState, markNotified, saveState, hasNotified } from './state.js';
import { formatTelegramNotification, sendTelegramMessage } from './telegram.js';
import { isLoggedIn, openMax, readChats, readLatestIncomingMessages, waitForLogin } from './max-web.js';

assertRuntimeConfig();

const context = await openBrowserContext({
  profileDir: config.profileDir,
  headless: process.env.HEADLESS !== 'false'
});

const page = await getOrCreatePage(context);
await openMax(page, config.maxUrl);

if (!(await isLoggedIn(page))) {
  console.log('[startup] MAX Web не авторизован.');
  console.log('[startup] На Railway удобнее сначала выполнить локально: npm run auth, затем загрузить профиль в /data/playwright-profile.');
  await waitForLogin(page);
}

console.log(`[startup] Сервис запущен. Проверка каждые ${config.checkIntervalSeconds} секунд.`);

process.on('SIGINT', async () => {
  await context.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await context.close();
  process.exit(0);
});

async function scanOnce() {
  const state = await loadState(config.stateFile);
  const chats = await readChats(page);
  const unreadChats = chats.filter((chat) => chat.unreadCount > 0);

  console.log(`[scan] Чатов найдено: ${chats.length}; с непрочитанными: ${unreadChats.length}`);

  for (const chat of unreadChats) {
    const messages = await readLatestIncomingMessages(page, chat);

    for (const message of messages) {
      if (hasNotified(state, message.id)) continue;

      await sendTelegramMessage({
        token: config.telegramBotToken,
        chatId: config.telegramChatId,
        text: formatTelegramNotification(message)
      });

      markNotified(state, message.id);
      console.log(`[telegram] Уведомление отправлено: ${message.chatTitle}`);
    }
  }

  await saveState(config.stateFile, state);
}

while (true) {
  try {
    await scanOnce();
  } catch (error) {
    console.error('[scan] Ошибка проверки:', error);
  }

  await page.waitForTimeout(config.checkIntervalSeconds * 1000);
}
