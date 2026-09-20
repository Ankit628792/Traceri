import React from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  createHashHistory,
  Outlet,
  Navigate,
  useRouterState,
} from '@tanstack/react-router';
import { motion } from 'motion/react';
import { Navigation } from './components/Navigation';
import { ArchivePage } from './pages/ArchivePage';
import { StoryPage } from './pages/StoryPage';
import { ThreadsPage } from './pages/ThreadsPage';
import { AtlasPage } from './pages/AtlasPage';
import { DiscoveriesPage } from './pages/DiscoveriesPage';
import { CalendarPage } from './pages/CalendarPage';
import { ReceiptDetail } from './components/ReceiptDetail';
import { DatasetModal } from './components/DatasetModal';
import { CustomCursor } from './components/CustomCursor';
import { ReadingProgress } from './components/ReadingProgress';
import { ScrollToTop } from './components/ScrollToTop';
import { Footer } from './components/Footer';
import { useArchive } from './context/ArchiveContext';

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

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#E4E1DB] flex flex-col selection:bg-[#CFA04E]/30 selection:text-white relative">
      {/* Custom Fluid Cursor with Ribbon Trail */}
      <CustomCursor />

      {/* Reading Progress Indicator */}
      <ReadingProgress />

      {/* Minimal Simplified Navigation Header */}
      <Navigation />

      {/* Main Page Content Outlet with Editorial Entrance Animation */}
      <main className="flex-1 w-full relative">
        <motion.div
          key={currentPath}
          initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.38,
            ease: [0.16, 1, 0.3, 1] as const,
          }}
          className="w-full flex-1 flex flex-col"
        >
          <Outlet />
        </motion.div>
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
              window.location.hash = thread ? `#/threads?threadId=${thread.id}` : '#/threads';
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
]);

// Use hash history for guaranteed reliability within container iframes and preview URLs
export const hashHistory = createHashHistory();

export const router = createRouter({
  routeTree,
  history: hashHistory,
  defaultPreload: 'intent',
});

// Register router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
