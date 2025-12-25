/**
 * Auth Feature - Public API
 * 
 * This is the main entry point for the auth feature.
 * Import from '@features/auth' instead of deep imports.
 */

// Components
export { AuthModal } from './AuthModal';
export { UserMenu } from './UserMenu';

// Re-export the auth context hook and provider for convenience
export { useAuth, AuthProvider } from '@/context/AuthContext';
