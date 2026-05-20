import type { User } from '@/store/slices/authSlice';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

interface Document {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  rows: number;
  cols: number;
  cells: Record<string, any>;
}

const USERS_KEY = 'mock_users';
const DOCUMENTS_KEY = 'spreadsheet_documents';

const getUsers = (): StoredUser[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  const defaultUsers: StoredUser[] = [
    {
      id: '1',
      name: 'Тестовый пользователь',
      email: 'test@example.com',
      password: '12345678',
      createdAt: new Date().toISOString(),
    },
  ];
  saveUsers(defaultUsers);
  return defaultUsers;
};

const saveUsers = (users: StoredUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const loadDocuments = (): Document[] => {
  const data = localStorage.getItem(DOCUMENTS_KEY);
  if (!data) return [];
  return JSON.parse(data);
};

const getCurrentUserId = (): string | null => {
  const token = localStorage.getItem('spreadsheet_access_token');
  if (!token) return null;
  const parts = token.split('_');
  if (parts.length >= 3 && parts[0] === 'mock' && parts[1] === 'jwt') {
    return parts[2];
  }
  return null;
};

const generateToken = (userId: string): string => {
  return `mock_jwt_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

export const mockRegister = async (name: string, email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const users = getUsers();
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует');
  }
  
  const newUser: StoredUser = {
    id: String(users.length + 1),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsers(users);
  
  const accessToken = generateToken(newUser.id);
  const refreshToken = generateToken(newUser.id);
  
  return {
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
    accessToken,
    refreshToken,
  };
};

export const mockLogin = async (email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Неверный email или пароль');
  }
  
  const accessToken = generateToken(user.id);
  const refreshToken = generateToken(user.id);
  
  return {
    user: { id: user.id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
  };
};

export const mockRefreshToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!refreshToken || !refreshToken.startsWith('mock_jwt_')) {
    throw new Error('Invalid refresh token');
  }
  
  const userId = refreshToken.split('_')[2];
  const newAccessToken = generateToken(userId);
  
  return { accessToken: newAccessToken };
};

export const mockGetCurrentUser = async (accessToken: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (!accessToken || !accessToken.startsWith('mock_jwt_')) {
    throw new Error('Invalid token');
  }
  
  const userId = accessToken.split('_')[2];
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return { id: user.id, name: user.name, email: user.email };
};

export const getUserStats = async (userId: string): Promise<{ documentCount: number; registeredAt: string }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const documents = loadDocuments();
  const userDocs = documents.filter(doc => doc.userId === userId);
  
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  
  return {
    documentCount: userDocs.length,
    registeredAt: user?.createdAt || new Date().toISOString(),
  };
};

export const updateUserName = async (userId: string, newName: string): Promise<{ name: string }> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) throw new Error('User not found');
  
  users[userIndex].name = newName;
  saveUsers(users);
  
  return { name: newName };
};

export const changeUserPassword = async (userId: string, oldPassword: string, newPassword: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  if (user.password !== oldPassword) throw new Error('Неверный старый пароль');
  
  user.password = newPassword;
  saveUsers(users);
};