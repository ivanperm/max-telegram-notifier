import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { config } from './config.js';
import { openBrowserContext, getOrCreatePage, saveStorageState } from './browser.js';
import { openMax } from './max-web.js';

const profileDir = process.env.LOCAL_PLAYWRIGHT_PROFILE_DIR || config.localProfileDir;
const storageStateFile = process.env.LOCAL_STORAGE_STATE_FILE || config.localStorageStateFile;
const context = await openBrowserContext({
  profileDir,
  headless: false
});

try {
  const page = await getOrCreatePage(context);
  await openMax(page, config.maxUrl);

  console.log(`[auth] Local Playwright profile: ${profileDir}`);
  console.log('[auth] Log in to MAX Web in the opened browser window.');
  console.log('[auth] Wait until your chats are visible, then return to this terminal.');

  const rl = createInterface({ input, output });
  await rl.question('[auth] Press Enter only after MAX Web shows your chats...');
  rl.close();

  await saveStorageState(context, storageStateFile);
  console.log(`[auth] Saved storage state: ${storageStateFile}`);
  console.log('[auth] Upload storage-state.json to Railway: /data/storage-state.json');
} finally {
  await context.close().catch(() => {});
}
