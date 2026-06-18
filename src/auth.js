import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { config } from './config.js';
import { openBrowserContext, getOrCreatePage } from './browser.js';
import { isLoggedIn, openMax } from './max-web.js';

const profileDir = process.env.LOCAL_PLAYWRIGHT_PROFILE_DIR || config.localProfileDir;
const context = await openBrowserContext({
  profileDir,
  headless: false
});

try {
  const page = await getOrCreatePage(context);
  await openMax(page, config.maxUrl);

  console.log(`[auth] Local Playwright profile: ${profileDir}`);

  if (await isLoggedIn(page)) {
    console.log('[auth] MAX Web already looks authorized in this profile.');
  } else {
    console.log('[auth] Log in to MAX Web in the opened browser window.');
    console.log('[auth] When chats are visible, return to this terminal and press Enter.');

    const rl = createInterface({ input, output });
    await rl.question('[auth] Press Enter after MAX Web shows your chats...');
    rl.close();
  }

  console.log('[auth] Saving browser profile. You can upload it to Railway: /data/playwright-profile');
} finally {
  await context.close().catch(() => {});
}
