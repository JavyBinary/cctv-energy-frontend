import { useEffect, useMemo, useRef, useState } from 'react';
import type { CameraItem } from '../api';
import { cosineSimilarity } from '../modules/math';
import { SIMILARITY_THRESHOLD, TOP_K } from '../search_config';

export interface ProcessedCamera extends CameraItem {
  score: number;
}

export const useCameraSearch = (cameras: CameraItem[]) => {
  const [embeddings, setEmbeddings] = useState<Record<number, number[]>>({});
  const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const workerRef = useRef<Worker | null>(null);
  const requestedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const worker = new Worker(new URL('../workers/search.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, data } = e.data;
      switch (type) {
        case 'progress':
          if (data.status === 'progress' && typeof data.progress === 'number') {
            setProgress(data.progress);
          }
          break;
        case 'ready':
          setReady(true);
          break;
        case 'text_embeddings_ready':
          setEmbeddings((prev) => ({ ...prev, ...data }));
          break;
        case 'image_embedding_ready':
          setImageEmbedding(data);
          break;
        case 'error':
          setError('Не удалось выполнить поиск по изображению.');
          break;
      }
    };

    worker.postMessage({ type: 'init' });
    return () => worker.terminate();
  }, []);

  useEffect(() => {
    const fresh = cameras.filter((cam) => cam.description_en && !requestedRef.current.has(cam.id));
    if (fresh.length === 0) return;
    fresh.forEach((cam) => requestedRef.current.add(cam.id));
    workerRef.current?.postMessage({
      type: 'texts',
      data: fresh.map((cam) => ({ id: cam.id, description_en: cam.description_en })),
    });
  }, [cameras]);

  const items = useMemo<ProcessedCamera[]>(() => {
    if (!imageEmbedding) {
      return cameras.map((cam) => ({ ...cam, score: 0 }));
    }
    return cameras
      .filter((cam) => Boolean(embeddings[cam.id]))
      .map((cam) => ({
        ...cam,
        score: cosineSimilarity(imageEmbedding, embeddings[cam.id]),
      }))
      .filter((cam) => cam.score >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K);
  }, [cameras, embeddings, imageEmbedding]);

  const searchByImage = (file: File) => {
    setError('');
    workerRef.current?.postMessage({ type: 'image', data: file });
  };

  const resetSearch = () => {
    setImageEmbedding(null);
  };

  return {
    items,
    ready,
    progress,
    error,
    isSearching: imageEmbedding !== null,
    searchByImage,
    resetSearch,
  };
};
