import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import ReadingProgressBar from './components/ReadingProgressBar';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const PublicationPage = lazy(() => import('./pages/PublicationPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const MediumPage = lazy(() => import('./pages/MediumPage'));

const RouteLoadingFallback: React.FC = () => (
  <div className="mx-auto flex min-h-[40vh] w-full max-w-7xl items-center justify-center px-6 py-16">
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/80 dark:text-slate-300"
    >
      Loading page…
    </div>
  </div>
);

type TransitionIntent = 'forward' | 'backward';

function getRouteWeight(pathname: string): number {
  if (pathname === '/') return 0;
  if (pathname.startsWith('/about')) return 1;
  if (pathname.startsWith('/publication/')) return 3;
  if (pathname.startsWith('/publication')) return 2;
  if (pathname.startsWith('/medium')) return 4;
  if (pathname.startsWith('/contact')) return 5;
  return 6;
}

const AnimatedRouteViewport: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const previousPathRef = useRef(pathname);
  const [intent, setIntent] = useState<TransitionIntent>('forward');

  useEffect(() => {
    const currentWeight = getRouteWeight(pathname);
    const previousWeight = getRouteWeight(previousPathRef.current);

    setIntent(currentWeight >= previousWeight ? 'forward' : 'backward');
    previousPathRef.current = pathname;
  }, [pathname]);

  return (
    <div
      key={pathname}
      className={`route-transition-shell ${intent === 'forward' ? 'route-enter-forward' : 'route-enter-backward'}`}
    >
      {children}
    </div>
  );
};

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
};

const App: React.FC = () => (
  <div className="flex flex-col min-h-screen font-sans">
    <ReadingProgressBar />
    <a
      href="#main-content"
      className="skip-link sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
    >
      Skip to main content
    </a>
    <Header />
    <main id="main-content" className="flex-grow" tabIndex={-1}>
      <AnimatedRouteViewport>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/publication" element={<PublicationPage />} />
            <Route path="/publication/:id" element={<ArticleDetailPage />} />
            <Route path="/medium" element={<MediumPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<HomePage />} /> {/* fallback */}
          </Routes>
        </Suspense>
      </AnimatedRouteViewport>
    </main>
    <Footer />
    <ScrollToTopButton />
  </div>
);

const Root: React.FC = () => (
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <ScrollToTop />
    <App />
  </BrowserRouter>
);

export default Root;
