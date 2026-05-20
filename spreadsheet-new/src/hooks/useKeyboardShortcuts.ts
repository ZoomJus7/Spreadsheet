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
  isEditing = false,
}: UseKeyboardShortcutsProps) => {
  const { copyToClipboard, cutToClipboard, pasteFromClipboard, selectAll, clearCell } = useClipboard();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      
      if (isEditing) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (onMoveDown) onMoveDown();
          if (onExitEdit) onExitEdit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          if (onExitEdit) onExitEdit();
        } else if (e.key === 'Tab') {
          e.preventDefault();
          if (!e.shiftKey && onMoveRight) onMoveRight();
          else if (e.shiftKey && onMoveLeft) onMoveLeft();
        }
        return;
      }
      
      switch (e.key) {
        case 'ArrowRight':
          if (onMoveRight) onMoveRight();
          break;
        case 'ArrowLeft':
          if (onMoveLeft) onMoveLeft();
          break;
        case 'ArrowDown':
          if (onMoveDown) onMoveDown();
          break;
        case 'ArrowUp':
          if (onMoveUp) onMoveUp();
          break;
        case 'Enter':
          if (onMoveDown) onMoveDown();
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          clearCell();
          break;
        case 'a':
          if (isCtrl) {
            e.preventDefault();
            selectAll();
          }
          break;
        case 'c':
          if (isCtrl) {
            e.preventDefault();
            copyToClipboard();
          }
          break;
        case 'x':
          if (isCtrl) {
            e.preventDefault();
            cutToClipboard();
          }
          break;
        case 'v':
          if (isCtrl) {
            e.preventDefault();
            pasteFromClipboard();
          }
          break;
        case 'b':
          if (isCtrl && onBold) {
            e.preventDefault();
            onBold();
          }
          break;
        case 'i':
          if (isCtrl && onItalic) {
            e.preventDefault();
            onItalic();
          }
          break;
        case 'u':
          if (isCtrl && onUnderline) {
            e.preventDefault();
            onUnderline();
          }
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
    copyToClipboard,
    cutToClipboard,
    pasteFromClipboard,
    selectAll,
    clearCell,
  ]);
};