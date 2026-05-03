import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import { Suspense, lazy, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const Home = lazy(() => import('./pages/Home'));
const NewReading = lazy(() => import('./pages/NewReading'));
const ReadingDetail = lazy(() => import('./pages/ReadingDetail'));
const Journal = lazy(() => import('./pages/Journal'));
const SharedReading = lazy(() => import('./pages/SharedReading'));
const DeckManager = lazy(() => import('./pages/admin/DeckManager'));
const CardGallery = lazy(() => import('./pages/CardGallery'));
const ReadingTypeManager = lazy(() => import('./pages/admin/ReadingTypeManager'));
const News = lazy(() => import('./pages/News'));

// Sync dark mode with OS preference
function useDarkMode() {
  useEffect(() => {
    const apply = (dark) => document.documentElement.classList.toggle('dark', dark);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    apply(mq.matches);
    const handler = (e) => apply(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
}

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        style={{ minHeight: "100%" }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/new-reading" element={<NewReading />} />
              <Route path="/reading/:id" element={<ReadingDetail />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/shared/:shareId" element={<SharedReading />} />
              <Route path="/gallery" element={<CardGallery />} />
              <Route path="/admin/decks" element={<DeckManager />} />
              <Route path="/admin/reading-types" element={<ReadingTypeManager />} />
              <Route path="/news" element={<News />} />
              <Route path="*" element={<PageNotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return <PageLoader />;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return <AnimatedRoutes />;
};


function App() {
  useDarkMode();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }} />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
