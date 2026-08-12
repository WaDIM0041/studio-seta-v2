import { useEffect, useRef, useState } from 'react';
import { api, type GoogleProfile } from '../lib/api';

interface GoogleId {
  initialize: (config: {
    client_id: string;
    callback: (resp: { credential: string }) => void;
  }) => void;
  renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    google?: { accounts?: { id: GoogleId } };
  }
}

export interface GoogleSignInProps {
  onProfile: (profile: GoogleProfile) => void;
  onError?: (message: string) => void;
}

/**
 * "Sign in with Google" for clients. Uses the Google account already signed in
 * on the device/browser (Google Identity Services). The id_token is verified
 * server-side by POST /api/auth/google; the verified profile is returned via
 * onProfile so the booking form can be prefilled and the client's Google email
 * used for the calendar invite.
 */
export function GoogleSignIn({ onProfile, onError }: GoogleSignInProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const callbacksRef = useRef({ onProfile, onError });

  useEffect(() => {
    callbacksRef.current = { onProfile, onError };
  }, [onProfile, onError]);

  // Feature-detect: the button is only shown when GOOGLE_CLIENT_ID is set.
  useEffect(() => {
    let cancelled = false;
    void api
      .authConfig()
      .then((cfg) => {
        if (cancelled) return;
        setClientId(cfg.googleSignIn ? cfg.clientId : null);
      })
      .catch(() => {
        if (!cancelled) setClientId(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load the GIS script once and wait until it is available.
  useEffect(() => {
    if (!clientId || typeof document === 'undefined') return;
    if (window.google?.accounts?.id) {
      setScriptReady(true);
      return;
    }
    let alive = true;
    const existing = document.getElementById('gis-client') as HTMLScriptElement | null;
    const script = existing || document.createElement('script');
    if (!existing) {
      script.id = 'gis-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (alive) setScriptReady(true);
      };
      document.head.appendChild(script);
    }
    return () => {
      alive = false;
    };
  }, [clientId]);

  // Initialise the account chooser and render the button into the host node.
  useEffect(() => {
    if (!clientId || !scriptReady || !hostRef.current) return;
    const id = window.google?.accounts?.id;
    if (!id) return;

    id.initialize({
      client_id: clientId,
      callback: (resp) => {
        void api
          .googleSignIn(resp.credential)
          .then((profile) => callbacksRef.current.onProfile(profile))
          .catch((err: unknown) => {
            callbacksRef.current.onError?.(
              err instanceof Error ? err.message : 'Не удалось войти через Google',
            );
          });
      },
    });
    id.renderButton(hostRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      width: 320,
      text: 'continue_with',
      locale: 'ru',
    });
  }, [clientId, scriptReady]);

  if (!clientId) return null;

  return (
    <div className="booking-google">
      <div ref={hostRef} className="booking-google__btn" />
      <p className="micro">
        Используется аккаунт, вошедший на этом устройстве. Приглашение придёт в
        ваш Google Calendar.
      </p>
    </div>
  );
}
