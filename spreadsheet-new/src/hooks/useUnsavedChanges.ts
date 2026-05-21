import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

export const useUnsavedChanges = (hasUnsavedChanges: boolean) => {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const showConfirm = () => {
    if (!hasUnsavedChanges) return true;
    return window.confirm('У вас есть несохранённые изменения. Всё равно выйти?');
  };

  return { blocker, showConfirm };
};