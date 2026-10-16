import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import '@/styles/index.css';
import { getCachedBranding, applyBranding } from '@carecraft/branding';

// Synchronously seed the full theme (brand, status, neutral surfaces, sidebar
// and header) from cache BEFORE React renders anything, so returning users see
// the complete palette on first paint with no flash.
const cachedBranding = getCachedBranding();
if (cachedBranding) {
  applyBranding({
    theme: cachedBranding.theme,
    fontFamily: cachedBranding.fontFamily,
    updateMetaThemeColor: true,
    semanticTokens: true,
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
