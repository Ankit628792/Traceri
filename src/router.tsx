import React, { useState, useEffect, useRef } from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  createBrowserHistory,
  Outlet,
  Navigate,
  useRouterState,
  useNavigate,
} from '@tanstack/react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation } from './components/Navigation';
import { ArchivePage } from './pages/ArchivePage';
import { StoryPage } from './pages/StoryPage';
import { ThreadsPage } from './pages/ThreadsPage';
import { AtlasPage } from './pages/AtlasPage';
import { DiscoveriesPage } from './pages/DiscoveriesPage';
import { CalendarPage } from './pages/CalendarPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ReceiptDetail } from './components/ReceiptDetail';
import { DatasetModal } from './components/DatasetModal';
import { CustomCursor } from './components/CustomCursor';
import { ReadingProgress } from './components/ReadingProgress';
import { ScrollToTop } from './components/ScrollToTop';
import { Footer } from './components/Footer';
import { EditorialPageLoader } from './components/EditorialPageLoader';
import { useArchive } from './context/ArchiveContext';
import { updateRouteSEO } from './utils/seo';

// Root Layout Component
const RootLayout: React.FC = () => {
  const {
    archive,
    selectedReceipt,
    setSelectedReceipt,
    selectReceipt,
    showDatasetModal,
    setShowDatasetModal,
    setRawDataset,
  } = useArchive();

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const navigate = useNavigate();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const prevPathRef = useRef(currentPath);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Dynamically update document title, canonical link, social tags, and JSON-LD
    updateRouteSEO({ path: currentPath });
  }, [currentPath]);

  useEffect(() => {
    if (prevPathRef.current !== currentPath) {
      prevPathRef.current = currentPath;
      setIsRouteLoading(true);
      const timer = setTimeout(() => {
        setIsRouteLoading(false);
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [currentPath]);

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#E4E1DB] flex flex-col selection:bg-[#CFA04E]/30 selection:text-white relative">
      {/* Full-Screen App Entry & Route Navigation Loader */}
      <EditorialPageLoader
        isLoading={isInitialLoading || isRouteLoading}
        routePath={currentPath}
        onComplete={() => {
          if (isInitialLoading) setIsInitialLoading(false);
          if (isRouteLoading) setIsRouteLoading(false);
        }}
      />

      {/* Custom Fluid Cursor with Ribbon Trail */}
      <CustomCursor />

      {/* Reading Progress Indicator */}
      <ReadingProgress />

      {/* Minimal Simplified Navigation Header */}
      <Navigation />

      {/* Main Page Content Outlet with Editorial Entrance Animation */}
      <main className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
            transition={{
              duration: 0.38,
              ease: [0.16, 1, 0.3, 1] as const,
            }}
            className="w-full flex-1 flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Scroll to Top Action Button */}
      <ScrollToTop />

      {/* Sliding Receipt Detail Drawer */}
      {selectedReceipt && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedReceipt(null)}
          />
          <ReceiptDetail
            receipt={selectedReceipt}
            archive={archive}
            onClose={() => setSelectedReceipt(null)}
            onSelectReceipt={selectReceipt}
            onFollowThread={(startReceiptId) => {
              const thread = archive.threads.find((t) => t.receiptIds.includes(startReceiptId));
              if (thread) {
                navigate({ to: '/threads', search: { threadId: thread.id } });
              } else {
                navigate({ to: '/threads' });
              }
              setSelectedReceipt(null);
            }}
          />
        </>
      )}

      {/* Dataset Ingestion Modal */}
      {showDatasetModal && (
        <DatasetModal
          archive={archive}
          onClose={() => setShowDatasetModal(false)}
          onLoadNewData={(newData) => {
            setRawDataset(newData);
            setSelectedReceipt(null);
          }}
        />
      )}

      {/* Detailed Editorial Footer */}
      <Footer />
    </div>
  );
};

// Define Root Route
const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});

// Define Child Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ArchivePage,
});

const archiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/archive',
  component: () => <Navigate to="/" />,
});

const storyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/story',
  component: StoryPage,
});

const threadsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/threads',
  component: ThreadsPage,
});

const atlasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/atlas',
  component: AtlasPage,
});

const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/map',
  component: () => <Navigate to="/atlas" />,
});

const discoveriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/discoveries',
  component: DiscoveriesPage,
});

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calendar',
  component: CalendarPage,
});

// Catch-all route for unmatched paths
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$',
  component: NotFoundPage,
});

// Create Route Tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  archiveRoute,
  storyRoute,
  threadsRoute,
  atlasRoute,
  mapRoute,
  discoveriesRoute,
  calendarRoute,
  notFoundRoute,
]);

// Standard browser history for clean, direct path URLs (/threads, /story, /calendar) without hash fragments
export const browserHistory = createBrowserHistory();

export const router = createRouter({
  routeTree,
  history: browserHistory,
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFoundPage,
  trailingSlash: 'never',
});

// Register router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
