type Root = { getAttribute(name: string): string | null; setAttribute(name: string, value: string): void };
type Storage = { getItem(key: string): string | null; setItem(key: string, value: string): void };

export function toggleTheme(root: Root, storage: Storage): 'light' | 'dark' {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  storage.setItem('theme', next);
  return next;
}
