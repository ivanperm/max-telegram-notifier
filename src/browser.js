import { chromium } from 'playwright';
import { ensureDir } from './fs.js';

export async function openBrowserContext({ profileDir, headless = true }) {
  await ensureDir(profileDir);

  return chromium.launchPersistentContext(profileDir, {
    headless,
    viewport: { width: 1440, height: 1000 },
    locale: 'ru-RU',
    timezoneId: 'Asia/Yekaterinburg',
    args: [
      '--disable-dev-shm-usage',
      '--no-sandbox'
    ]
  });
}

export async function getOrCreatePage(context) {
  const pages = context.pages();
  return pages[0] || context.newPage();
}
