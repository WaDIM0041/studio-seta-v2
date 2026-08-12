interface IconProps {
  size?: number;
  className?: string;
}

export function IconVk({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.8 18.2c-5.8 0-9.1-4-9.2-10.6h2.9c.1 4.8 2.2 6.8 3.9 7.2V7.6h2.7v4.1c1.7-.2 3.4-2 4-4.1h2.7c-.5 2.7-2.4 4.5-3.7 5.3 1.3.6 3.4 2.3 4.2 5.3h-3c-.6-2-2.2-3.6-4.2-3.8v3.8h-.3Z" />
    </svg>
  );
}

export function IconTelegram({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.7 4.5 3.9 10.9c-.8.3-.8 1.4 0 1.7l4.2 1.3 1.6 5c.2.7 1.1.9 1.6.4l2.3-2.2 4.3 3.2c.6.4 1.4.1 1.6-.6l3.6-14.3c.2-.8-.5-1.5-1.4-1.4ZM9.6 13.4l7.7-5.6c.3-.2.6.2.4.4l-6.4 6.2-.2 2.6-1.5-3.6Z" />
    </svg>
  );
}

export function IconInstagram({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconWhatsApp({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.4A10 10 0 1 0 12 2Zm5.1 13.7c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .2-3.4-.7-2.9-1.1-4.7-3.8-4.9-4-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c0 .2.1.4 0 .6l-.4.6-.5.5c-.1.1-.3.3-.1.6.1.3.7 1.2 1.6 1.9 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.9-1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.6.3.1.1.1.6-.1 1.2Z" />
    </svg>
  );
}

export function IconSearch({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function IconClose({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconArrowRight({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <path d="M4 12h15m0 0-6-6m6 6-6 6" />
    </svg>
  );
}

export function IconChevronLeft({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="m14.5 5-7 7 7 7" />
    </svg>
  );
}

export function IconChevronRight({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="m9.5 5 7 7-7 7" />
    </svg>
  );
}

export function IconCheck({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="m4.5 12.5 5 5L19.5 7" />
    </svg>
  );
}

export function IconCalendar({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
      <path d="M4 10h16M8.5 3v4M15.5 3v4" />
    </svg>
  );
}

export function IconSparkle({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2c.6 5.2 1.9 8.6 4.5 10.2 1.1.7 2.2 1 5.5 1.3-3.6.6-5.3 1.5-6.3 2.9C14.6 18.2 13.9 20 13 24c-.5-4-1.4-6.3-3.2-7.7C8.2 15.2 6.4 14.5 2 14.2c3.2-.5 5.2-1.3 6.2-2.7C9.2 10 10 7.7 12 2Z" />
    </svg>
  );
}

export function IconMenu({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
