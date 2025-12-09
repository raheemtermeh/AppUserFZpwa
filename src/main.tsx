import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles.css";
import AppLayout from "./ui/AppLayout";
import HomePage from "./pages/HomePage";
import FiltersPage from "./pages/FiltersPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";
import CategoriesPage from "./pages/CategoriesPage";
import VenuePage from "./pages/VenuePage";
import VenueDetailPage from "./pages/VenueDetailPage";
import SocialHubsPage from "./pages/SocialHubsPage";
import ReservationsPage from "./pages/ReservationsPage";
import MVPDemoPage from "./pages/MVPDemoPage";
import EventsPage from "./pages/EventsPage";
import MapPage from "./pages/MapPage";
import SupportPage from "./pages/SupportPage";
import RootProvider from "./ui/RootProvider";
import { LanguageProvider } from "./contexts/LanguageContext";
import ErrorBoundary from "./components/ErrorBoundary";

// Create a wrapper component that includes all providers
function AppWithProviders() {
  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: (
          <ErrorBoundary>
            <LanguageProvider>
              <RootProvider>
                <AppLayout />
              </RootProvider>
            </LanguageProvider>
          </ErrorBoundary>
        ),
        errorElement: <ErrorBoundary />,
        children: [
          {
            index: true,
            element: <HomePage />,
            errorElement: <ErrorBoundary />,
          },
          {
            path: "events",
            element: <EventsPage />,
            errorElement: <ErrorBoundary />,
          },
          {
            path: "filters",
            element: <FiltersPage />,
            errorElement: <ErrorBoundary />,
          },
          {
            path: "categories",
            element: <CategoriesPage />,
            errorElement: <ErrorBoundary />,
          },
          {
            path: "venues",
            element: <SocialHubsPage />,
            errorElement: <ErrorBoundary />,
          },
          {
            path: "map",
            element: <MapPage />,
            errorElement: <ErrorBoundary />,
          },
          {
            path: "venue/:id",
            element: <VenueDetailPage />,
            errorElement: <ErrorBoundary />,
          },
          {
            path: "event/:id",
            element: <EventDetailsPage />,
            errorElement: <ErrorBoundary />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
            errorElement: <ErrorBoundary />,
          },
          {
            path: "reservations",
            element: <ReservationsPage />,
            errorElement: <ErrorBoundary />,
          },
          {
            path: "support",
            element: <SupportPage />,
            errorElement: <ErrorBoundary />,
          },
          {
            path: "cart",
            element: <CartPage />,
            errorElement: <ErrorBoundary />,
          },
          // Catch-all route for unmatched paths
          { path: "*", element: <HomePage />, errorElement: <ErrorBoundary /> },
        ],
      },
      {
        path: "/login",
        element: (
          <ErrorBoundary>
            <LanguageProvider>
              <RootProvider>
                <LoginPage />
              </RootProvider>
            </LanguageProvider>
          </ErrorBoundary>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "/demo",
        element: (
          <ErrorBoundary>
            <LanguageProvider>
              <RootProvider>
                <MVPDemoPage />
              </RootProvider>
            </LanguageProvider>
          </ErrorBoundary>
        ),
        errorElement: <ErrorBoundary />,
      },
      // Catch-all route for root level unmatched paths
      {
        path: "*",
        element: (
          <ErrorBoundary>
            <LanguageProvider>
              <RootProvider>
                <HomePage />
              </RootProvider>
            </LanguageProvider>
          </ErrorBoundary>
        ),
        errorElement: <ErrorBoundary />,
      },
    ],
    {
      future: {
        v7_startTransition: true,
      },
    }
  );

  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWithProviders />
  </React.StrictMode>
);

// Capture beforeinstallprompt as early as possible so AppLayout can show install button
(window as any).deferredPwaPrompt = null;
window.addEventListener("beforeinstallprompt", (e: any) => {
  try {
    e.preventDefault();
    (window as any).deferredPwaPrompt = e;
    console.debug("beforeinstallprompt captured");
  } catch (err) {
    // ignore
  }
});

// Register service worker for PWA on secure contexts or localhost
if (
  "serviceWorker" in navigator &&
  (import.meta.env.PROD ||
    location.protocol === "https:" ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1")
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  });
}
