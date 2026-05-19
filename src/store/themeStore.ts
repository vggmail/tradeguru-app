import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: true, // Default to dark mode for trading aesthetic
      toggleTheme: () => {
        const next = !get().isDark;
        set({ isDark: next });
        if (next) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      },
      initTheme: () => {
        if (get().isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }
    }),
    { name: 'tradeguru-theme' }
  )
);
