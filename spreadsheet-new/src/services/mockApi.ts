import type { Document, DocumentMeta } from '@/types/document';
import type { CellData } from '@/types/spreadsheet';

const STORAGE_KEY = 'spreadsheet_documents';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const loadAll = (): Document[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data);
};

const saveAll = (docs: Document[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
};

export const getDocuments = async (): Promise<DocumentMeta[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const docs = loadAll();
  return docs.map(({ id, name, createdAt, updatedAt, rows, cols }) => ({
    id, name, createdAt, updatedAt, rows, cols
  }));
};

export const getDocumentById = async (id: string): Promise<Document | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const docs = loadAll();
  return docs.find(d => d.id === id) || null;
};

export const createDocument = async (name: string, rows: number, cols: number): Promise<Document> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const now = Date.now();
  const newDoc: Document = {
    id: generateId(),
    name,
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

export const updateDocument = async (id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const docs = loadAll();
  const index = docs.findIndex(d => d.id === id);
  if (index === -1) throw new Error('Document not found');
  docs[index] = { ...docs[index], ...updates, updatedAt: Date.now() };
  saveAll(docs);
};

export const deleteDocument = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const docs = loadAll();
  const filtered = docs.filter(d => d.id !== id);
  saveAll(filtered);
};

export const duplicateDocument = async (id: string): Promise<Document> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const docs = loadAll();
  const original = docs.find(d => d.id === id);
  if (!original) throw new Error('Document not found');
  const now = Date.now();
  const newDoc: Document = {
    ...original,
    id: generateId(),
    name: `${original.name} (копия)`,
    createdAt: now,
    updatedAt: now,
  };
  docs.push(newDoc);
  saveAll(docs);
  return newDoc;
};