import "@/lib/antdReact19";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "@/styles/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Helmet, HelmetProvider } from "@dr.pogodin/react-helmet";
import { getCachedBranding, applyBranding } from "@carecraft/branding";

// Seed the saved branding synchronously before React renders so the font and
// palette are correct on the first paint, including after a full browser restart.
const cachedBranding = getCachedBranding();
if (cachedBranding) {
  applyBranding({
    theme: cachedBranding.theme,
    fontFamily: cachedBranding.fontFamily,
    updateMetaThemeColor: true,
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </QueryClientProvider>
  </StrictMode>,
);
