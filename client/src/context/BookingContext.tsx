import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { BookingModal } from '../components/BookingModal';

interface BookingContextValue {
  openBooking: (serviceId?: string) => void;
  isOpen: boolean;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const preselectRef = useRef<string | undefined>(undefined);

  const openBooking = useCallback((serviceId?: string) => {
    preselectRef.current = serviceId;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ openBooking, isOpen }),
    [openBooking, isOpen],
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingModal isOpen={isOpen} onClose={close} preselectServiceId={preselectRef.current} />
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
