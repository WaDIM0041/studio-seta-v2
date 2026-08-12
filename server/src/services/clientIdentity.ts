export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture: string;
  emailVerified: boolean;
}

/**
 * Minimal shape of the verified id_token payload from Google Identity Services.
 * See https://developers.google.com/identity/openid-connect/openid-connect.
 */
export interface GoogleIdTokenPayload {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

/** Maps a verified Google id_token payload to the client profile we store. */
export function mapGoogleProfile(payload: GoogleIdTokenPayload): GoogleProfile | null {
  const email = payload.email?.trim().toLowerCase();
  if (!payload.sub || !email) return null;
  return {
    sub: payload.sub,
    email,
    name: payload.name?.trim() || '',
    picture: payload.picture || '',
    emailVerified: payload.email_verified === true,
  };
}
