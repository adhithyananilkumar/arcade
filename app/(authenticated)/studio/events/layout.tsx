import React from 'react';

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="workshop-layout">
      {children}
    </div>
  );
}
