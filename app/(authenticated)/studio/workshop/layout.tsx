import React from 'react';

export default function WorkshopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="workshop-layout">
      {children}
    </div>
  );
}
