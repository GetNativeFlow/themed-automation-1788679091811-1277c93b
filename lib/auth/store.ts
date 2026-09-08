// AUTO-GENERATED. Disabled-auth build — sentinel authenticated state.
import { create } from 'zustand';
import type { AuthState } from './types';

interface Store extends AuthState {
  setState: (s: Partial<AuthState>) => void;
  accessToken: string | null;
}

export const useAuthStore = create<Store>((set) => ({
  status: 'authenticated',
  user: null,
  permissions: [],
  accessToken: null,
  setState: (s) => set(s),
}));
