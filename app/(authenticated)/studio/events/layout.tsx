import React from 'react';

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return (
    // A flex column, not a plain block: pages under it use `flex-1` to fill the immersive shell.
    <div className="workshop-layout flex flex-1 flex-col">
      {children}
    </div>
  );
}
