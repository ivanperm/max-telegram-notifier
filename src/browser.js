import { chromium } from 'playwright';
import { dirname } from 'node:path';
import { access, readFile } from 'node:fs/promises';
import { ensureDir } from './fs.js';

export async function openBrowserContext({ profileDir, headless = true, storageStateFile = '' }) {
  const storageState = storageStateFile && await loadStorageState(storageStateFile);

  if (storageState) {
    const browser = await chromium.launch({
      headless,
      args: [
        '--disable-dev-shm-usage',
        '--no-sandbox'
      ]
    });

    const context = await browser.newContext({
      storageState: storageStateFile,
      viewport: { width: 1440, height: 1000 },
      locale: 'ru-RU',
      timezoneId: 'Asia/Yekaterinburg'
    });

    const closeContext = context.close.bind(context);
    context.close = async (...args) => {
      await closeContext(...args).catch(() => {});
      await browser.close().catch(() => {});
    };

    return context;
  }

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

export async function saveStorageState(context, storageStateFile) {
  if (!storageStateFile) return;
  await ensureDir(dirname(storageStateFile));
  await context.storageState({ path: storageStateFile, indexedDB: true });
}

async function loadStorageState(storageStateFile) {
  let state;

  try {
    await access(storageStateFile);
    state = JSON.parse(await readFile(storageStateFile, 'utf8'));
  } catch (error) {
    console.log(`[browser] Storage state not loaded from ${storageStateFile}: ${error.message}`);
    return null;
  }

  const indexedDbOrigins = (state.origins || [])
    .filter((origin) => Array.isArray(origin.indexedDB) && origin.indexedDB.length > 0)
    .length;

  console.log(`[browser] Loading storage state from ${storageStateFile}: ${(state.cookies || []).length} cookies, ${(state.origins || []).length} origins, ${indexedDbOrigins} IndexedDB origins`);
  return state;
}
