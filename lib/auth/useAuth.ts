// AUTO-GENERATED. Disabled-auth build.
import { useAuthStore } from './store';

export function useAuth() {
  return useAuthStore((s) => ({ status: s.status, user: s.user, permissions: s.permissions }));
}

export function usePermission(_perm: string): boolean {
  return true;
}

const noop = async () => {};

/** Disabled build — nothing to bridge; the sentinel state never changes. */
export function startAuthBridge(): () => void {
  return () => {};
}

/** Disabled build — actions exist so screens compile, but do nothing. */
export function useAuthActions() {
  return {
    signIn: noop,
    signUp: noop,
    signOut: noop,
    sendOtp: noop,
    verifyOtp: noop,
    sendMagicLink: noop,
    resetPassword: noop,
  };
}
