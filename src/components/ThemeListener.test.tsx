import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeListener } from './ThemeListener';

describe('[P1] ThemeListener Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renders nothing (returns null)', () => {
    const { container } = render(<ThemeListener />);
    expect(container).toBeEmptyDOMElement();
  });

  it('adds the dark class to documentElement when themeChange event fires with dark mode in localStorage', () => {
    render(<ThemeListener />);

    localStorage.setItem('theme', 'dark');

    // Dispatch custom themeChange event
    window.dispatchEvent(new Event('themeChange'));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes the dark class from documentElement when themeChange event fires with light mode in localStorage', () => {
    // Start with dark mode applied
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'light');

    render(<ThemeListener />);

    // Dispatch custom themeChange event
    window.dispatchEvent(new Event('themeChange'));

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('responds to storage events for the theme key across tabs/windows', () => {
    render(<ThemeListener />);

    // Set localStorage as a cross-tab event would
    localStorage.setItem('theme', 'dark');

    // Simulate cross-tab storage change event
    const storageEvent = new StorageEvent('storage', {
      key: 'theme',
      newValue: 'dark',
    });
    window.dispatchEvent(storageEvent);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('ignores storage events for unrelated keys', () => {
    document.documentElement.classList.remove('dark');
    render(<ThemeListener />);

    const storageEvent = new StorageEvent('storage', {
      key: 'some_other_key',
      newValue: 'dark',
    });
    window.dispatchEvent(storageEvent);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
