import React from 'react';

export default function ChatIllustration({ className = '' }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg viewBox="0 0 600 400" className="w-full h-full">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Background blobs */}
        <g opacity="0.18">
          <circle cx="120" cy="80" r="90" fill="url(#g2)" />
          <circle cx="520" cy="60" r="70" fill="url(#g1)" />
          <circle cx="80" cy="320" r="60" fill="url(#g2)" />
        </g>

        {/* Chat bubbles */}
        <g filter="url(#shadow)">
          <rect x="90" y="110" rx="20" ry="20" width="280" height="110" fill="#ffffff" />
          <path d="M160 220 L155 255 L190 230 Z" fill="#ffffff" />
          <circle cx="140" cy="165" r="8" fill="#cbd5e1" />
          <circle cx="165" cy="165" r="8" fill="#cbd5e1" />
          <circle cx="190" cy="165" r="8" fill="#cbd5e1" />
        </g>

        <g filter="url(#shadow)">
          <rect x="320" y="210" rx="20" ry="20" width="190" height="90" fill="#0ea5e9" />
          <path d="M430 300 L465 322 L455 290 Z" fill="#0ea5e9" />
          <circle cx="350" cy="250" r="7" fill="#bae6fd" />
          <circle cx="372" cy="250" r="7" fill="#bae6fd" />
          <circle cx="394" cy="250" r="7" fill="#bae6fd" />
        </g>
      </svg>
      <div className="absolute inset-0 rounded-3xl ring-1 ring-white/30" />
    </div>
  );
}


