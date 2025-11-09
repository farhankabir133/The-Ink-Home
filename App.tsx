import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PublicationPage from './pages/PublicationPage';
import ContactPage from './pages/ContactPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import MediumPage from './pages/MediumPage';

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
};

const App: React.FC = () => (
  <div className="flex flex-col min-h-screen font-sans">
    <Header />
    <main className="flex-grow">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/publication" element={<PublicationPage />} />
        <Route path="/publication/:id" element={<ArticleDetailPage />} />
        <Route path="/medium" element={<MediumPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<HomePage />} /> {/* fallback */}
      </Routes>
    </main>
    <Footer />
    <ScrollToTopButton />
  </div>
);

const Root: React.FC = () => (
  <HashRouter>
    <ScrollToTop />
    <App />
  </HashRouter>
);

export default Root;
