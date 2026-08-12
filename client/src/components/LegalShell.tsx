import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function LegalShell({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="legal">
      <div className="container container--narrow">
        <Link to="/" className="legal__back">
          ← На главную
        </Link>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="legal__title">{title}</h1>
        <p className="micro">Дата редакции: {updated}</p>
        <hr className="gold-rule" />
        <div className="legal__body">{children}</div>
      </div>
    </div>
  );
}

export function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="legal__section">
      <h2>
        <span className="legal__num">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
