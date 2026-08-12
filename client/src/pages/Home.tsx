import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Marquee } from '../components/Marquee';
import { About } from '../components/About';
import { Services } from '../components/Services';
import { Portfolio } from '../components/Portfolio';
import { Reviews } from '../components/Reviews';
import { BookingCta } from '../components/BookingCta';
import { ContactBar } from '../components/ContactBar';
import { LocationMap } from '../components/LocationMap';
import { Footer } from '../components/Footer';
import { CookieBanner } from '../components/CookieBanner';
import { SearchOverlay } from '../components/SearchOverlay';
import { api, type ServiceDef } from '../lib/api';

export function Home() {
  const [services, setServices] = useState<ServiceDef[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    void api
      .services()
      .then((r) => setServices(r.services))
      .catch(() => setServices([]));
  }, []);

  return (
    <>
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Services services={services} />
        <Portfolio />
        <Reviews />
        <BookingCta />
        <LocationMap />
        <ContactBar />
      </main>
      <Footer />
      <CookieBanner />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} services={services} />
    </>
  );
}
