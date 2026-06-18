import { config } from './config.js';
import { openBrowserContext, getOrCreatePage } from './browser.js';
import { isLoggedIn, openMax, waitForLogin } from './max-web.js';

const profileDir = process.env.LOCAL_PLAYWRIGHT_PROFILE_DIR || config.localProfileDir;
const context = await openBrowserContext({
  profileDir,
  headless: false
});

const page = await getOrCreatePage(context);
await openMax(page, config.maxUrl);

console.log(`[auth] Локальный профиль Playwright: ${profileDir}`);

if (!(await isLoggedIn(page))) {
  await waitForLogin(page);
} else {
  console.log('[auth] Авторизация уже есть в профиле.');
}

console.log('[auth] Сессия сохранена. Теперь можно загрузить содержимое профиля в Railway Volume: /data/playwright-profile');
console.log('[auth] Браузер останется открытым до Ctrl+C, чтобы вы могли проверить вход.');

process.on('SIGINT', async () => {
  await context.close();
  process.exit(0);
});

await new Promise(() => {});
