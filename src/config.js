import 'dotenv/config';

export const config = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  checkIntervalSeconds: Number(process.env.CHECK_INTERVAL_SECONDS || 15),
  maxUrl: process.env.MAX_URL || 'https://web.max.ru',
  profileDir: process.env.PLAYWRIGHT_PROFILE_DIR || '/data/playwright-profile',
  stateFile: process.env.STATE_FILE || '/data/state.json',
  localProfileDir: process.env.LOCAL_PLAYWRIGHT_PROFILE_DIR || './playwright-profile'
};

export function assertRuntimeConfig() {
  const missing = [];

  if (!config.telegramBotToken) missing.push('TELEGRAM_BOT_TOKEN');
  if (!config.telegramChatId) missing.push('TELEGRAM_CHAT_ID');
  if (!Number.isFinite(config.checkIntervalSeconds) || config.checkIntervalSeconds < 5) {
    missing.push('CHECK_INTERVAL_SECONDS >= 5');
  }

  if (missing.length > 0) {
    throw new Error(`Missing or invalid environment variables: ${missing.join(', ')}`);
  }
}
