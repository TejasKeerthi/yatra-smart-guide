
export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

// Mock exports to maintain API compatibility
export const auth = null;
export const db = null;

const SIMULATED_USER_KEY = 'yatra_simulated_user';

export const loginWithGoogle = async (): Promise<User> => {
  return simulateLogin("Google User", "https://ui-avatars.com/api/?name=Google+User&background=DB4437&color=fff");
};

export const loginWithMicrosoft = async (): Promise<User> => {
  return simulateLogin("Microsoft User", "https://ui-avatars.com/api/?name=Microsoft+User&background=00A4EF&color=fff");
};

export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  // Mock validation logic
  if (!email || !email.includes('@')) {
     throw { code: 'auth/invalid-email', message: 'Invalid email address.' };
  }
  if (password.length < 6) {
    throw { code: 'auth/weak-password', message: 'Password should be at least 6 characters.' };
  }

  const name = email.split('@')[0];
  const photoURL = `https://ui-avatars.com/api/?name=${name}&background=random&color=fff`;
  
  return simulateLogin(name, photoURL, email);
};

export const registerWithEmail = async (email: string, password: string): Promise<User> => {
  return loginWithEmail(email, password);
};

export const logoutUser = async () => {
  localStorage.removeItem(SIMULATED_USER_KEY);
  window.dispatchEvent(new Event('auth-change'));
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  const checkAuth = () => {
    const saved = localStorage.getItem(SIMULATED_USER_KEY);
    callback(saved ? JSON.parse(saved) : null);
  };

  checkAuth();
  
  const listener = () => checkAuth();
  window.addEventListener('auth-change', listener);
  window.addEventListener('storage', listener);

  return () => {
    window.removeEventListener('auth-change', listener);
    window.removeEventListener('storage', listener);
  };
};

const simulateLogin = (name: string, photoURL: string, email?: string): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user: User = {
        uid: "user-" + Math.random().toString(36).substr(2, 9),
        displayName: name,
        email: email || `${name.toLowerCase().replace(' ', '.')}@example.com`,
        photoURL: photoURL
      };
      localStorage.setItem(SIMULATED_USER_KEY, JSON.stringify(user));
      window.dispatchEvent(new Event('auth-change'));
      resolve(user);
    }, 1000);
  });
};
