import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { BookingProvider } from './context/BookingContext';
import { Home } from './pages/Home';
import { Privacy } from './pages/Privacy';
import { TermsOfUse } from './pages/TermsOfUse';
import { CookieBanner } from './components/CookieBanner';
import { AuroraBackground } from './components/AuroraBackground';
import { Preloader } from './components/Preloader';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Preloader />
      <AuroraBackground />
      <BookingProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <CookieBanner />
      </BookingProvider>
    </BrowserRouter>
  );
}
