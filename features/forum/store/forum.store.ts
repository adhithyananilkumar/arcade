import { create } from 'zustand';

interface ForumState {
  unreadNotificationCount: number;
  wsConnected: boolean;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  setWsConnected: (connected: boolean) => void;
}

export const useForumStore = create<ForumState>((set) => ({
  unreadNotificationCount: 0,
  wsConnected: false,
  setUnreadCount: (count) => set({ unreadNotificationCount: count }),
  incrementUnreadCount: () =>
    set((state) => ({ unreadNotificationCount: state.unreadNotificationCount + 1 })),
  setWsConnected: (connected) => set({ wsConnected: connected }),
}));
