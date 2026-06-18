export const selectors = {
  auth: {
    loggedIn: [
      '[data-testid*="chat"]',
      '[data-testid*="dialog"]',
      '[aria-label*="чат" i]',
      '[aria-label*="chat" i]',
      'main'
    ],
    loggedOut: [
      'input[type="tel"]',
      'input[name*="phone" i]',
      '[data-testid*="login" i]',
      'text=/QR|код|phone|телефон|войти/i'
    ]
  },
  chats: {
    list: [
      '[data-testid*="chat-list" i]',
      '[data-testid*="dialog-list" i]',
      '[class*="chat-list" i]',
      '[class*="dialog-list" i]',
      'nav',
      'aside'
    ],
    item: [
      '[data-testid*="chat-item" i]',
      '[data-testid*="dialog-item" i]',
      '[role="listitem"]',
      '[class*="chat-item" i]',
      '[class*="dialog" i][class*="item" i]'
    ],
    title: [
      '[data-testid*="chat-title" i]',
      '[data-testid*="dialog-title" i]',
      '[class*="title" i]',
      '[class*="name" i]'
    ],
    unreadBadge: [
      '[data-testid*="unread" i]',
      '[class*="unread" i]',
      '[aria-label*="непрочитан" i]',
      '[aria-label*="unread" i]'
    ],
    preview: [
      '[data-testid*="preview" i]',
      '[class*="preview" i]',
      '[class*="last-message" i]',
      '[class*="message" i]'
    ],
    time: [
      'time',
      '[data-testid*="time" i]',
      '[class*="time" i]',
      '[class*="date" i]'
    ]
  },
  messages: {
    container: [
      '[data-testid*="message-list" i]',
      '[class*="message-list" i]',
      '[role="log"]',
      'main'
    ],
    item: [
      '[data-testid*="message" i]',
      '[class*="message" i]',
      '[role="listitem"]'
    ],
    incoming: [
      '[data-testid*="incoming" i]',
      '[class*="incoming" i]',
      '[class*="inbound" i]'
    ],
    outgoing: [
      '[data-testid*="outgoing" i]',
      '[class*="outgoing" i]',
      '[class*="own" i]'
    ],
    text: [
      '[data-testid*="message-text" i]',
      '[class*="message-text" i]',
      '[class*="text" i]',
      '[dir="auto"]'
    ],
    author: [
      '[data-testid*="author" i]',
      '[class*="author" i]',
      '[class*="sender" i]',
      '[class*="name" i]'
    ],
    time: [
      'time',
      '[data-testid*="message-time" i]',
      '[class*="time" i]'
    ],
    attachment: [
      '[data-testid*="attachment" i]',
      '[class*="attachment" i]',
      'img',
      'video',
      'audio'
    ]
  }
};
