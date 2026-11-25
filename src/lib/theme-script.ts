/** Where the chosen theme ('light' | 'dark' | 'system') is stored. Kept as-is so existing choices survive. */
export const THEME_STORAGE_KEY = 'vite-ui-theme'

/**
 * Inline script for <head>: applies the theme class and color-scheme before the first paint, so
 * dark-mode users never see a flash of the light theme. Self-contained (no imports at runtime).
 */
export const themeInitScript = `(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var choice = stored === 'light' || stored === 'dark' ? stored : 'system';
    var dark = choice === 'dark' || (choice === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    root.classList.remove(dark ? 'light' : 'dark');
    root.classList.add(dark ? 'dark' : 'light');
    root.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();`
