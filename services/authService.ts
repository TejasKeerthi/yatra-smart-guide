// MOCK AUTH SERVICE
// Replaces Firebase with local simulation to avoid "Component not registered" errors.

export const auth = null;
export const db = null;

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

const MOCK_USER: User = {
  uid: 'mock-user-123',
  displayName: 'Demo Traveler',
  email: 'demo@yatra.ai',
  photoURL: 'https://ui-avatars.com/api/?name=Demo+Traveler&background=0d9488&color=fff'
};

const setSession = (user: User | null) => {
  if (user) {
    localStorage.setItem('yatra_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('yatra_user');
  }
  // Dispatch event for reactive updates if needed
  window.dispatchEvent(new Event('auth-change'));
};

export const loginWithGoogle = async (): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  const user = { ...MOCK_USER, displayName: 'Google User' };
  setSession(user);
  return user;
};

export const loginWithMicrosoft = async (): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const user = { ...MOCK_USER, displayName: 'Microsoft User' };
  setSession(user);
  return user;
};

export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const user = { 
    ...MOCK_USER, 
    email, 
    displayName: email.split('@')[0],
    photoURL: `https://ui-avatars.com/api/?name=${email}&background=random`
  };
  setSession(user);
  return user;
};

export const registerWithEmail = async (email: string, password: string): Promise<User> => {
  return loginWithEmail(email, password);
};

export const logoutUser = async () => {
  setSession(null);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  // Initial check
  const stored = localStorage.getItem('yatra_user');
  if (stored) {
    callback(JSON.parse(stored));
  } else {
    callback(null);
  }

  // Listen for custom event
  const handler = () => {
    const stored = localStorage.getItem('yatra_user');
    callback(stored ? JSON.parse(stored) : null);
  };
  
  window.addEventListener('auth-change', handler);
  return () => window.removeEventListener('auth-change', handler);
};