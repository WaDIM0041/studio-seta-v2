import { useEffect, useState } from 'react';
import '../styles/preloader.css';

export function Preloader() {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    setShouldRender(true);
    // Tiny delay to ensure DOM is ready and CSS transition works
    const showTimeout = setTimeout(() => {
      setVisible(true);
    }, 50);

    // Fade out preloader after 4.2s (allows drawing hand + drop + text animation to complete)
    const fadeTimeout = setTimeout(() => {
      setVisible(false);
    }, 4200);

    // Fully remove from DOM after transition completes (5s total)
    const removeTimeout = setTimeout(() => {
      setShouldRender(false);
    }, 5000);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(fadeTimeout);
      clearTimeout(removeTimeout);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div className={`preloader ${!visible ? 'preloader--hidden' : ''}`} role="alert" aria-busy="true">
      <div className="preloader__container">
        {/* Animated Drop Ripple */}
        <div className="preloader__ripple-container">
          <div className="preloader__ripple" />
        </div>

        <svg
          viewBox="0 0 200 240"
          className="preloader__svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Slender hand line-art */}
          <path
            d="M 50 240 C 50 210, 55 180, 55 160 C 55 140, 45 130, 40 120 C 35 110, 38 100, 42 100 C 47 100, 53 115, 58 130 C 60 110, 65 80, 68 50 C 69 40, 75 40, 76 50 C 80 80, 82 110, 83 130 C 85 110, 92 75, 95 40 C 96 30, 102 30, 103 40 C 106 75, 108 110, 109 130 C 111 115, 118 85, 121 55 C 122 45, 128 45, 129 55 C 132 85, 133 115, 134 135 C 136 120, 143 95, 147 70 C 148 60, 154 60, 155 70 C 158 95, 159 130, 155 170 C 150 210, 145 230, 140 240"
            className="preloader__hand-path"
          />

          {/* Almond nails */}
          <path
            d="M 38 101 C 36 99, 36 96, 38 94 C 40 92, 43 94, 45 97 C 46 99, 44 102, 38 101 Z"
            className="preloader__nail"
          />
          <path
            d="M 65 52 C 65 47, 68 44, 69 44 C 70 44, 73 47, 73 52 C 72 56, 66 56, 65 52 Z"
            className="preloader__nail"
          />
          {/* Middle Nail where the drop lands */}
          <path
            d="M 92 42 C 92 37, 95 34, 96 34 C 97 34, 100 37, 100 42 C 99 46, 93 46, 92 42 Z"
            className="preloader__nail"
            style={{ stroke: 'var(--gold)' }}
          />
          <path
            d="M 118 57 C 118 52, 121 49, 122 49 C 123 49, 126 52, 126 57 C 125 61, 119 61, 118 57 Z"
            className="preloader__nail"
          />
          <path
            d="M 144 72 C 144 67, 147 64, 148 64 C 149 64, 152 67, 152 72 C 151 76, 145 76, 144 72 Z"
            className="preloader__nail"
          />

          {/* Falling cosmetic drop (oil/polish) */}
          <circle cx="96" cy="34" r="2.8" className="preloader__drop" />
        </svg>

        <h1 className="preloader__brand">
          STUDIO <em>S</em>ETA
        </h1>
        <p className="preloader__subtitle">by Catherine</p>
      </div>
    </div>
  );
}
