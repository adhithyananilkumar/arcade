'use client';

import { createContext, useContext, useState } from 'react';

const ForumLayoutContext = createContext({
  hideTrending: false,
  setHideTrending: (_: boolean) => {},
});

export function ForumLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hideTrending, setHideTrending] = useState(false);
  
  return (
    <ForumLayoutContext.Provider value={{ hideTrending, setHideTrending }}>
      {children}
    </ForumLayoutContext.Provider>
  );
}

export const useForumLayout = () => useContext(ForumLayoutContext);
