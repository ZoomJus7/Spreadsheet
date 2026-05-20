import type { Document, DocumentMeta } from '@/types/document';
import type { CellData } from '@/types/spreadsheet';

const STORAGE_KEY = 'spreadsheet_documents';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Получение текущего пользователя из localStorage
const getCurrentUserId = (): string | null => {
  const token = localStorage.getItem('spreadsheet_access_token');
  if (!token) return null;
  // Извлекаем userId из токена (mock_jwt_{userId}_...)
  const parts = token.split('_');
  if (parts.length >= 3 && parts[0] === 'mock' && parts[1] === 'jwt') {
    return parts[2];
  }
  return null;
};

const loadAll = (): Document[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data);
};

const saveAll = (docs: Document[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
};

// Получение документов только текущего пользователя
export const getDocuments = async (): Promise<DocumentMeta[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const userId = getCurrentUserId();
  if (!userId) return [];
  const docs = loadAll();
  const userDocs = docs.filter(doc => doc.userId === userId);
  return userDocs.map(({ id, name, createdAt, updatedAt, rows, cols }) => ({
    id, name, createdAt, updatedAt, rows, cols
  }));
};

export const getDocumentById = async (id: string): Promise<Document | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const userId = getCurrentUserId();
  if (!userId) return null;
  const docs = loadAll();
  const doc = docs.find(d => d.id === id);
  if (doc && doc.userId !== userId) return null;
  return doc || null;
};

export const createDocument = async (name: string, rows: number, cols: number): Promise<Document> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');
  const now = Date.now();
  const newDoc: Document = {
    id: generateId(),
    name,
    userId,
    createdAt: now,
    updatedAt: now,
    rows,
    cols,
    cells: {},
  };
  const docs = loadAll();
  docs.push(newDoc);
  saveAll(docs);
  return newDoc;
};

export const updateDocument = async (id: string, updates: Partial<Omit<Document, 'id' | 'createdAt' | 'userId'>>): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');
  const docs = loadAll();
  const index = docs.findIndex(d => d.id === id);
  if (index === -1) throw new Error('Document not found');
  if (docs[index].userId !== userId) throw new Error('Forbidden');
  docs[index] = { ...docs[index], ...updates, updatedAt: Date.now() };
  saveAll(docs);
};

export const deleteDocument = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');
  const docs = loadAll();
  const index = docs.findIndex(d => d.id === id);
  if (index !== -1 && docs[index].userId === userId) {
    docs.splice(index, 1);
    saveAll(docs);
  }
};

export const duplicateDocument = async (id: string): Promise<Document> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');
  const docs = loadAll();
  const original = docs.find(d => d.id === id);
  if (!original) throw new Error('Document not found');
  if (original.userId !== userId) throw new Error('Forbidden');
  const now = Date.now();
  const newDoc: Document = {
    ...original,
    id: generateId(),
    name: `${original.name} (копия)`,
    userId,
    createdAt: now,
    updatedAt: now,
  };
  docs.push(newDoc);
  saveAll(docs);
  return newDoc;
};