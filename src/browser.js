import { chromium } from 'playwright';
import { dirname } from 'node:path';
import { readFile } from 'node:fs/promises';
import { ensureDir } from './fs.js';

export async function openBrowserContext({ profileDir, headless = true, storageStateFile = '' }) {
  await ensureDir(profileDir);

  const context = await chromium.launchPersistentContext(profileDir, {
    headless,
    viewport: { width: 1440, height: 1000 },
    locale: 'ru-RU',
    timezoneId: 'Asia/Yekaterinburg',
    args: [
      '--disable-dev-shm-usage',
      '--no-sandbox'
    ]
  });

  if (storageStateFile) {
    await applyStorageState(context, storageStateFile);
  }

  return context;
}

export async function getOrCreatePage(context) {
  const pages = context.pages();
  return pages[0] || context.newPage();
}

export async function saveStorageState(context, storageStateFile) {
  if (!storageStateFile) return;
  await ensureDir(dirname(storageStateFile));
  await context.storageState({ path: storageStateFile });
}

async function applyStorageState(context, storageStateFile) {
  let state;

  try {
    state = JSON.parse(await readFile(storageStateFile, 'utf8'));
  } catch {
    return;
  }

  if (Array.isArray(state.cookies) && state.cookies.length > 0) {
    await context.addCookies(state.cookies).catch(() => {});
  }

  for (const originState of state.origins || []) {
    if (!originState.origin) continue;

    const page = await context.newPage();
    try {
      await page.goto(originState.origin, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.evaluate((data) => {
        for (const item of data.localStorage || []) {
          window.localStorage.setItem(item.name, item.value);
        }
        for (const item of data.sessionStorage || []) {
          window.sessionStorage.setItem(item.name, item.value);
        }
      }, originState);
    } catch {
      // Cookies alone may still be enough; keep startup resilient.
    } finally {
      await page.close().catch(() => {});
    }
  }
}
