import { config } from './config.js';
import { openBrowserContext, getOrCreatePage } from './browser.js';
import { inspectSelectors, isLoggedIn, openMax, readChats } from './max-web.js';

const context = await openBrowserContext({
  profileDir: process.env.LOCAL_PLAYWRIGHT_PROFILE_DIR || config.profileDir,
  headless: process.env.HEADLESS === 'true'
});

try {
  const page = await getOrCreatePage(context);
  await openMax(page, config.maxUrl);

  const loggedIn = await isLoggedIn(page);
  const chats = loggedIn ? await readChats(page) : [];
  const selectorReport = await inspectSelectors(page);
  const unreadCount = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  console.log('\n== MAX Web diagnostics ==');
  console.log(`Авторизация: ${loggedIn ? 'обнаружена' : 'не обнаружена'}`);
  console.log(`Найденные чаты: ${chats.length}`);
  console.log(`Количество непрочитанных сообщений: ${unreadCount}`);
  console.log('\nЧаты:');
  for (const chat of chats) {
    console.log(`- [${chat.unreadCount}] ${chat.title} :: ${chat.preview || '(без превью)'}`);
  }

  console.log('\nНайденные селекторы:');
  console.log(JSON.stringify(selectorReport, null, 2));
} finally {
  if (process.env.KEEP_BROWSER_OPEN === 'true') {
    console.log('\nKEEP_BROWSER_OPEN=true, браузер оставлен открытым. Нажмите Ctrl+C для выхода.');
    await new Promise(() => {});
  } else {
    await context.close();
  }
}
