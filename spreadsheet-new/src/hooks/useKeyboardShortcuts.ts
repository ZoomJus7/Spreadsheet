import { useEffect } from 'react';
import { useClipboard } from './useClipboard';

interface UseKeyboardShortcutsProps {
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onMoveRight?: () => void;
  onMoveLeft?: () => void;
  onMoveDown?: () => void;
  onMoveUp?: () => void;
  onExitEdit?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  isEditing?: boolean;
}

export const useKeyboardShortcuts = ({
  onBold,
  onItalic,
  onUnderline,
  onMoveRight,
  onMoveLeft,
  onMoveDown,
  onMoveUp,
  onExitEdit,
  onUndo,
  onRedo,
  isEditing = false,
}: UseKeyboardShortcutsProps) => {
  const { copyToClipboard, cutToClipboard, pasteFromClipboard, selectAll, clearCell } = useClipboard();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      
      // Предотвращаем все комбинации
      if (isCtrl || ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'enter', 'escape', 'tab', 'delete', 'backspace'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      if (isCtrl && key === 'z' && !e.shiftKey) {
        if (onUndo) onUndo();
        return;
      }
      
      if (isCtrl && (key === 'y' || (key === 'z' && e.shiftKey))) {
        if (onRedo) onRedo();
        return;
      }
      
      if (isCtrl && key === 'a') {
        selectAll();
        return;
      }
      
      if (isCtrl && key === 'c') {
        copyToClipboard();
        return;
      }
      
      if (isCtrl && key === 'x') {
        cutToClipboard();
        return;
      }
      
      if (isCtrl && key === 'v') {
        pasteFromClipboard();
        return;
      }
      
      if (isCtrl && key === 'b') {
        if (onBold) onBold();
        return;
      }
      
      if (isCtrl && key === 'i') {
        if (onItalic) onItalic();
        return;
      }
      
      if (isCtrl && key === 'u') {
        if (onUnderline) onUnderline();
        return;
      }
      
      if (isEditing) {
        if (key === 'enter') {
          if (onMoveDown) onMoveDown();
          if (onExitEdit) onExitEdit();
          return;
        }
        if (key === 'escape') {
          if (onExitEdit) onExitEdit();
          return;
        }
        if (key === 'tab') {
          if (!e.shiftKey && onMoveRight) onMoveRight();
          else if (e.shiftKey && onMoveLeft) onMoveLeft();
          return;
        }
        return;
      }
      
      switch (key) {
        case 'arrowright':
          if (onMoveRight) onMoveRight();
          break;
        case 'arrowleft':
          if (onMoveLeft) onMoveLeft();
          break;
        case 'arrowdown':
          if (onMoveDown) onMoveDown();
          break;
        case 'arrowup':
          if (onMoveUp) onMoveUp();
          break;
        case 'enter':
          if (onMoveDown) onMoveDown();
          break;
        case 'delete':
        case 'backspace':
          clearCell();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isEditing,
    onBold,
    onItalic,
    onUnderline,
    onMoveRight,
    onMoveLeft,
    onMoveDown,
    onMoveUp,
    onExitEdit,
    onUndo,
    onRedo,
    copyToClipboard,
    cutToClipboard,
    pasteFromClipboard,
    selectAll,
    clearCell,
  ]);
};