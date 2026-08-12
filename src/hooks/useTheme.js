import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { THEME_MODES } from '../utils/constants';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const saved = storage.get('algolens_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? THEME_MODES.LIGHT : THEME_MODES.DARK;
  });

  const [colorblind, setColorblind] = useState(() => {
    return storage.get('algolens_colorblind', false);
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-colorblind', colorblind.toString());
    storage.set('algolens_theme', theme);
    storage.set('algolens_colorblind', colorblind);
  }, [theme, colorblind]);

  const toggleTheme = () => {
    setTheme(prev => prev === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK);
  };

  const toggleColorblind = () => {
    setColorblind(prev => !prev);
  };

  return { theme, toggleTheme, colorblind, toggleColorblind };
};
