import { User } from './types';

const USERS_STORAGE_KEY = 'khan-blood-link-users';

// --- Helper functions for localStorage ---
const loadUsersFromStorage = (): User[] => {
  try {
    const serializedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (serializedUsers === null) {
      return [];
    }
    return JSON.parse(serializedUsers);
  } catch (error) {
    console.error("Could not load users from localStorage", error);
    return [];
  }
};

const saveUsersToStorage = (users: User[]) => {
  try {
    const serializedUsers = JSON.stringify(users);
    localStorage.setItem(USERS_STORAGE_KEY, serializedUsers);
  } catch (error) {
    console.error("Could not save users to localStorage", error);
  }
};

// --- In-memory store with persistence ---
let users: User[] = loadUsersFromStorage();
let listeners: (() => void)[] = [];

const emitChange = () => {
  for (const listener of listeners) {
    listener();
  }
};

export const userStore = {
  getUsers: (): User[] => users,

  addUser: (user: User) => {
    const existingUser = users.find(u => u.email === user.email);
    if (!existingUser) {
      users = [...users, user];
      saveUsersToStorage(users);
      emitChange();
    }
  },

  updateUser: (updatedUser: User) => {
    users = users.map(user => (user.id === updatedUser.id ? updatedUser : user));
    saveUsersToStorage(users);
    emitChange();
  },

  findUserById: (id: number): User | undefined => {
    return users.find(u => u.id === id);
  },

  findUserByCredentials: (email: string, password?: string): User | undefined => {
    return users.find(u => u.email === email && u.password === password);
  },

  emailExists: (email: string): boolean => {
      return users.some(u => u.email === email);
  },

  subscribe: (listener: () => void): (() => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
};
