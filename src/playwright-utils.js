export async function firstVisibleLocator(root, selectors) {
  for (const selector of selectors) {
    const locator = root.locator(selector).first();
    try {
      if (await locator.count() > 0 && await locator.isVisible({ timeout: 500 })) {
        return { selector, locator };
      }
    } catch {
      // Some selectors are intentionally broad and may fail while the app rerenders.
    }
  }

  return null;
}

export async function firstText(root, selectors) {
  const found = await firstVisibleLocator(root, selectors);
  if (!found) return '';
  return cleanText(await found.locator.innerText().catch(() => ''));
}

export async function visibleCount(root, selectors) {
  for (const selector of selectors) {
    try {
      const count = await root.locator(selector).count();
      if (count > 0) return { selector, count };
    } catch {
      // Keep trying fallback selectors.
    }
  }

  return { selector: null, count: 0 };
}

export function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

export function stableId(parts) {
  return parts.map((part) => cleanText(part).toLowerCase()).join('|');
}
