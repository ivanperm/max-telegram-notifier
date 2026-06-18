import { selectors } from '../selectors.js';
import { cleanText, firstText, firstVisibleLocator, stableId, visibleCount } from './playwright-utils.js';

export async function openMax(page, maxUrl) {
  await page.goto(maxUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
}

export async function isLoggedIn(page) {
  const loggedIn = await firstVisibleLocator(page, selectors.auth.loggedIn);
  const loggedOut = await firstVisibleLocator(page, selectors.auth.loggedOut);

  return Boolean(loggedIn && !loggedOut);
}

export async function waitForLogin(page, { pollMs = 3000 } = {}) {
  while (!(await isLoggedIn(page))) {
    console.log('[auth] MAX Web не авторизован. Войдите вручную в открытом браузере, сессия сохранится в профиль Playwright.');
    await page.waitForTimeout(pollMs);
  }

  console.log('[auth] Авторизация обнаружена. Продолжаю работу.');
}

export async function readChats(page) {
  const chatList = await firstVisibleLocator(page, selectors.chats.list);
  const root = chatList?.locator || page;

  for (const selector of selectors.chats.item) {
    const items = root.locator(selector);
    const count = await items.count().catch(() => 0);
    if (count === 0) continue;

    const chats = [];
    const maxItems = Math.min(count, 50);

    for (let index = 0; index < maxItems; index += 1) {
      const item = items.nth(index);
      const rawText = cleanText(await item.innerText().catch(() => ''));
      if (!rawText) continue;

      const title = await firstText(item, selectors.chats.title) || guessChatTitle(rawText);
      const preview = await firstText(item, selectors.chats.preview) || guessPreview(rawText, title);
      const time = await firstText(item, selectors.chats.time);
      const unreadText = await firstText(item, selectors.chats.unreadBadge);
      const unreadCount = parseUnreadCount(unreadText || rawText);

      chats.push({
        index,
        selector,
        title,
        preview,
        time,
        unreadCount,
        rawText
      });
    }

    if (chats.length > 0) return chats;
  }

  return [];
}

export async function readLatestIncomingMessages(page, chat) {
  const chats = page.locator(chat.selector);
  const chatItem = chats.nth(chat.index);
  await chatItem.click({ timeout: 5000 });
  await page.waitForTimeout(1000);

  const container = await firstVisibleLocator(page, selectors.messages.container);
  const root = container?.locator || page;

  for (const selector of selectors.messages.item) {
    const items = root.locator(selector);
    const count = await items.count().catch(() => 0);
    if (count === 0) continue;

    const messages = [];
    const start = Math.max(0, count - Math.max(chat.unreadCount || 1, 5));

    for (let index = start; index < count; index += 1) {
      const item = items.nth(index);
      const rawText = cleanText(await item.innerText().catch(() => ''));
      if (!rawText) continue;

      if (await looksOutgoing(item)) continue;

      const text = await firstText(item, selectors.messages.text) || rawText;
      const author = await firstText(item, selectors.messages.author) || 'неизвестно';
      const time = await firstText(item, selectors.messages.time) || chat.time;
      const hasAttachment = Boolean(await firstVisibleLocator(item, selectors.messages.attachment));
      const id = stableId([chat.title, author, text, time || rawText]);

      messages.push({
        id,
        chatTitle: chat.title,
        author,
        text: hasAttachment && !text ? '' : text,
        time,
        hasAttachment,
        rawText
      });
    }

    return messages;
  }

  if (chat.unreadCount > 0) {
    return [{
      id: stableId([chat.title, chat.preview, chat.time]),
      chatTitle: chat.title,
      author: 'неизвестно',
      text: chat.preview,
      time: chat.time,
      hasAttachment: !chat.preview,
      rawText: chat.rawText
    }];
  }

  return [];
}

export async function inspectSelectors(page) {
  const result = {
    auth: {
      loggedIn: await visibleCount(page, selectors.auth.loggedIn),
      loggedOut: await visibleCount(page, selectors.auth.loggedOut)
    },
    chats: {
      list: await visibleCount(page, selectors.chats.list),
      item: await visibleCount(page, selectors.chats.item),
      unreadBadge: await visibleCount(page, selectors.chats.unreadBadge)
    },
    messages: {
      container: await visibleCount(page, selectors.messages.container),
      item: await visibleCount(page, selectors.messages.item),
      incoming: await visibleCount(page, selectors.messages.incoming),
      outgoing: await visibleCount(page, selectors.messages.outgoing)
    }
  };

  return result;
}

async function looksOutgoing(messageLocator) {
  if (await firstVisibleLocator(messageLocator, selectors.messages.outgoing)) return true;
  if (await firstVisibleLocator(messageLocator, selectors.messages.incoming)) return false;

  const className = await messageLocator.getAttribute('class').catch(() => '') || '';
  return /out|own|sent|self/i.test(className);
}

function parseUnreadCount(text) {
  const match = cleanText(text).match(/\b([1-9]\d*)\b/);
  return match ? Number(match[1]) : 0;
}

function guessChatTitle(rawText) {
  return rawText.split(/\s{2,}|\n/).map(cleanText).filter(Boolean)[0] || 'Без названия';
}

function guessPreview(rawText, title) {
  return cleanText(rawText.replace(title, '')).slice(0, 500);
}
