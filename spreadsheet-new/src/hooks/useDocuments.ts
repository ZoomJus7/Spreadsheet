import { useState, useEffect, useCallback } from 'react';
import { getDocuments, createDocument, updateDocument, deleteDocument, duplicateDocument, getDocumentById } from '@/services/mockApi';
import type { DocumentMeta, Document } from '@/types/document';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const docs = await getDocuments();
      setDocuments(docs);
      setError(null);
    } catch {
      setError('Ошибка загрузки документов');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(async (name: string, rows: number, cols: number): Promise<Document | null> => {
    try {
      const newDoc = await createDocument(name, rows, cols);
      await refresh();
      return newDoc;
    } catch {
      setError('Ошибка создания документа');
      return null;
    }
  }, [refresh]);

  const rename = useCallback(async (id: string, newName: string) => {
    try {
      await updateDocument(id, { name: newName });
      await refresh();
    } catch {
      setError('Ошибка переименования');
    }
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteDocument(id);
      await refresh();
    } catch {
      setError('Ошибка удаления');
    }
  }, [refresh]);

  const duplicate = useCallback(async (id: string) => {
    try {
      await duplicateDocument(id);
      await refresh();
    } catch {
      setError('Ошибка дублирования');
    }
  }, [refresh]);

  const getOne = useCallback(async (id: string): Promise<Document | null> => {
    try {
      return await getDocumentById(id);
    } catch {
      setError('Ошибка загрузки документа');
      return null;
    }
  }, []);

  return { documents, loading, error, add, rename, remove, duplicate, getOne, refresh };
};