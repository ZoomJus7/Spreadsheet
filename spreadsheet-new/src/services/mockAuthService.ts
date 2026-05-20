import type { User } from '@/store/slices/authSlice';

// Хранилище пользователей (имитация базы данных)
interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string; // в реальном проекте должен быть хеш
}

let users: StoredUser[] = [];

// Загрузка пользователей из localStorage
const loadUsers = (): StoredUser[] => {
  const stored = localStorage.getItem('mock_users');
  if (stored) {
    users = JSON.parse(stored);
  } else {
    // Добавляем тестового пользователя
    users = [
      {
        id: '1',
        name: 'Тестовый пользователь',
        email: 'test@example.com',
        password: '12345678',
      },
    ];
    saveUsers();
  }
  return users;
};

const saveUsers = () => {
  localStorage.setItem('mock_users', JSON.stringify(users));
};

// Генерация простого токена (имитация JWT)
const generateToken = (userId: string): string => {
  return `mock_jwt_${userId}_${Date.now()}_${Math.random().toString(36).substr(2)}`;
};

// Регистрация
export const mockRegister = async (name: string, email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  loadUsers();
  
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует');
  }
  
  const newUser: StoredUser = {
    id: String(users.length + 1),
    name,
    email,
    password,
  };
  
  users.push(newUser);
  saveUsers();
  
  const accessToken = generateToken(newUser.id);
  const refreshToken = generateToken(newUser.id);
  
  return {
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
    accessToken,
    refreshToken,
  };
};

// Вход
export const mockLogin = async (email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  loadUsers();
  
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

// Обновление токена
export const mockRefreshToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Простая валидация: проверяем, что токен начинается с mock_jwt_
  if (!refreshToken || !refreshToken.startsWith('mock_jwt_')) {
    throw new Error('Invalid refresh token');
  }
  
  const userId = refreshToken.split('_')[2];
  const newAccessToken = generateToken(userId);
  
  return { accessToken: newAccessToken };
};

// Получение текущего пользователя по токену
export const mockGetCurrentUser = async (accessToken: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (!accessToken || !accessToken.startsWith('mock_jwt_')) {
    throw new Error('Invalid token');
  }
  
  const userId = accessToken.split('_')[2];
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return { id: user.id, name: user.name, email: user.email };
};