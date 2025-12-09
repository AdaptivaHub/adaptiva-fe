import { useState, useCallback } from 'react';

interface UseDragDropOptions {
  onFileDrop: (file: File) => void;
  disabled?: boolean;
}

export function useDragDrop({ onFileDrop, disabled = false }: UseDragDropOptions) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) onFileDrop(file);
  }, [onFileDrop, disabled]);

  // Props to spread onto the drop target element
  const dragProps = {
    onDragEnter: handleDrag,
    onDragLeave: handleDrag,
    onDragOver: handleDrag,
    onDrop: handleDrop,
  };

  return { isDragActive, dragProps };
}
