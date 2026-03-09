import { useState, useCallback } from 'react';

/**
 * Hook to manage canvas state and persistence.
 */
export function useCanvasState() {
  const [canvasJSON, setCanvasJSON] = useState(null);

  const saveState = useCallback((canvas) => {
    if (!canvas) return;
    const json = canvas.toJSON(['id', 'selectable', 'hasControls']);
    setCanvasJSON(json);
    return json;
  }, []);

  const loadState = useCallback((canvas, json) => {
    if (!canvas || !json) return;
    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
    });
  }, []);

  return {
    canvasJSON,
    setCanvasJSON,
    saveState,
    loadState
  };
}
