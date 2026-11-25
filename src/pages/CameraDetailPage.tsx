import { useEffect, useState } from 'react';
import { Alert, Badge, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { CameraItem, getCamera, mediaUrl } from '../api';

export function CameraDetailPage() {
  const { id } = useParams();
  const [camera, setCamera] = useState<CameraItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cameraId = Number(id);
    if (!Number.isInteger(cameraId) || cameraId <= 0) {
      setError('Камера не найдена.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    getCamera(cameraId)
      .then(setCamera)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <main className="app-container">
      <Link to="/" className="back-link">
        ← К списку камер
      </Link>

      {loading && (
        <div className="loading-box">
          <Spinner animation="border" variant="danger" role="status" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {camera && (
        <article className="detail-card">
          <div className="detail-image-wrap">
            <img
              src={mediaUrl(camera.image_url)}
              alt={camera.model_name}
              className="detail-image"
            />
          </div>
          <div className="detail-info">
            <h1 className="detail-title">{camera.model_name}</h1>
            <div className="detail-badges">
              <Badge bg="danger">
                {camera.power !== null ? `${camera.power.toFixed(1)} Вт` : '—'}
              </Badge>
              <Badge bg="secondary">{camera.resolution || 'Full HD'}</Badge>
              <Badge bg="light" text="dark" className="border">
                ♥ {camera.likes_count}
              </Badge>
            </div>
            <p className="detail-desc">{camera.description || 'Описание отсутствует.'}</p>
            {camera.description_en && (
              <p className="detail-desc-en">
                <strong>EN (CLIP):</strong> {camera.description_en}
              </p>
            )}
          </div>
        </article>
      )}
    </main>
  );
}
