'use client';

import React from 'react';

export const PoweredByFooter: React.FC = () => {
  return (
    <footer className="py-8 text-center bg-transparent">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-stone/60">
        Powered by <span className="text-forest/60">SafariWrap</span>
      </p>
    </footer>
  );
};
