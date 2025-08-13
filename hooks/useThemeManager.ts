
import { useEffect, useState } from 'react';

interface Theme {
  primary: string;
  primaryFocus: string;
  primaryContent: string;
  secondary: string;
  secondaryContent: string;
  accent: string;
  base100: string; 
  base200: string;
  base300: string;
}

interface EventTheme {
  event: string;
  date: string; // "MM-DD"
  theme: Theme;
}

const applyTheme = (theme: Theme, eventName: string) => {
    // Remove old theme style tag if it exists
    const oldStyle = document.getElementById('dynamic-theme-styles');
    if (oldStyle) {
        oldStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'dynamic-theme-styles';
    style.innerHTML = `
    /* KenPOS Theme: ${eventName} */

    /* Primary colors (emerald) */
    .bg-emerald-100 { background-color: ${theme.base200} !important; color: ${theme.primary} !important; }
    .bg-emerald-500 { background-color: ${theme.primary} !important; color: ${theme.primaryContent} !important; }
    .bg-emerald-600 { background-color: ${theme.primary} !important; color: ${theme.primaryContent} !important; }
    .hover\\:bg-emerald-700:hover { background-color: ${theme.primaryFocus} !important; }
    .text-emerald-600 { color: ${theme.primary} !important; }
    .text-emerald-700 { color: ${theme.primaryFocus} !important; }
    .focus\\:ring-emerald-500:focus { --tw-ring-color: ${theme.primary} !important; }
    .border-emerald-500 { border-color: ${theme.primary} !important; }
    .peer-checked\\:bg-emerald-600:checked { background-color: ${theme.primary} !important; }

    /* Accent colors (used for various highlights) */
    .text-indigo-600 { color: ${theme.accent} !important; }
    .bg-indigo-100 { background-color: ${theme.base200} !important; }
    .text-indigo-800 { color: ${theme.accent} !important; }

    /* Base colors (slate) */
    .bg-slate-50 { background-color: ${theme.base100} !important; }
    .bg-slate-100 { background-color: ${theme.base100} !important; }
    .antialiased.bg-slate-100 { background-color: ${theme.base100} !important; }
    body.bg-slate-100 { background-color: ${theme.base100} !important; }
    .bg-slate-200 { background-color: ${theme.base200} !important; }
    .hover\\:bg-slate-100:hover { background-color: ${theme.base200} !important; }
    .hover\\:bg-slate-200:hover { background-color: ${theme.base300} !important; }
    .border-slate-200 { border-color: ${theme.base300} !important; }
    .border-slate-300 { border-color: ${theme.base300} !important; }
    
    /* Global Background */
    body.bg-slate-200 { background-color: ${theme.base200} !important; }
    .bg-slate-200 { background-color: ${theme.base200} !important; }
    .h-screen.bg-slate-200 { background-color: ${theme.base200} !important; }
    `;

    document.head.appendChild(style);
};

const clearTheme = () => {
    const style = document.getElementById('dynamic-theme-styles');
    if (style) {
        style.remove();
    }
};

export const useThemeManager = () => {
  const [currentEvent, setCurrentEvent] = useState<string | null>(null);

  useEffect(() => {
    const checkAndApplyTheme = async () => {
      try {
        const response = await fetch('/event-themes.json');
        if (!response.ok) {
          console.warn('Could not fetch event themes.');
          return;
        }
        const eventThemes: EventTheme[] = await response.json();
        
        const today = new Date();
        const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const eventForToday = eventThemes.find(event => event.date === todayStr);

        if (eventForToday) {
          applyTheme(eventForToday.theme, eventForToday.event);
          setCurrentEvent(eventForToday.event);
        } else {
          clearTheme();
          setCurrentEvent(null);
        }
      } catch (error) {
        console.error('Error loading or applying theme:', error);
      }
    };

    checkAndApplyTheme();
    // Run this check periodically in case the app is left open over midnight
    const interval = setInterval(checkAndApplyTheme, 1000 * 60 * 60); // every hour
    return () => clearInterval(interval);
  }, []);

  return { currentEvent };
};
