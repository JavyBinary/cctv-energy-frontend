import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Form, ProgressBar, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CameraItem, getCameras, mediaUrl } from '../api';
import { useCameraSearch } from '../hooks/useCameraSearch';

const DEFAULT_POWER_MAX = 15.0;

export function CameraCatalogPage() {
  const [sliderPower, setSliderPower] = useState(DEFAULT_POWER_MAX);
  const [cameras, setCameras] = useState<CameraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    items,
    ready,
    progress,
    error: searchError,
    isSearching,
    searchByImage,
    resetSearch,
  } = useCameraSearch(cameras);

  const load = (powerMax: number) => {
    setLoading(true);
    setError('');
    getCameras(powerMax)
      .then(setCameras)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(DEFAULT_POWER_MAX);
  }, []);

  const handleFilterSubmit = (event: FormEvent) => {
    event.preventDefault();
    load(sliderPower);
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (selectedImage) URL.revokeObjectURL(selectedImage);
      setSelectedImage(URL.createObjectURL(file));
      searchByImage(file);
    }
  };

  const handleClear = () => {
    if (selectedImage) URL.revokeObjectURL(selectedImage);
    setSelectedImage(null);
    resetSearch();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const progressPct = `${(sliderPower / 15.0) * 100}%`;

  return (
    <main className="app-container">
      <header className="page-header">
        <h1 className="page-title">Каталог камер видеонаблюдения</h1>
      </header>

      <Form className="filter-section" onSubmit={handleFilterSubmit}>
        <div className="filter-slider-group">
          <Form.Label htmlFor="power_max" className="filter-label">
            Мощность до: <strong>{sliderPower.toFixed(1)} Вт</strong>
          </Form.Label>
          <input
            id="power_max"
            type="range"
            min="0"
            max="15"
            step="0.1"
            value={sliderPower}
            onChange={(e) => setSliderPower(parseFloat(e.target.value))}
            className="power-range-slider"
            style={{ '--progress': progressPct } as React.CSSProperties}
          />
        </div>
        <Button type="submit" variant="cctv">
          Найти
        </Button>
      </Form>

      <section className="search-section">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <div className="preview-wrapper">
          {selectedImage ? (
            <img src={selectedImage} alt="Изображение для поиска" className="preview-image" />
          ) : (
            <div className="placeholder-image">Нет фото</div>
          )}
        </div>
        <div className="action-panel">
          <Button
            variant="cctv"
            onClick={() => fileInputRef.current?.click()}
            disabled={!ready}
          >
            {ready ? 'Загрузить фото (CLIP)' : 'Загрузка нейросети...'}
          </Button>
          {!ready && (
            <ProgressBar
              now={progress}
              label={`${Math.round(progress)}%`}
              animated
              variant="danger"
            />
          )}
          <Button
            variant="outline-secondary"
            onClick={handleClear}
            disabled={!selectedImage}
          >
            Сбросить
          </Button>
        </div>
      </section>

      {searchError && <Alert variant="danger">{searchError}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {loading && (
        <div className="loading-box">
          <Spinner animation="border" variant="danger" role="status" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          {isSearching
            ? 'Похожие модели камер не найдены (ниже порога сходства).'
            : 'Камеры не найдены.'}
        </div>
      )}

      <div className="camera-grid">
        {!loading &&
          items.map((camera) => (
            <Card as="article" key={camera.id} className="camera-card">
              <Link to={`/cameras/${camera.id}`} className="camera-card-img-link">
                <Card.Img
                  src={mediaUrl(camera.image_url)}
                  alt={camera.model_name}
                  className="camera-card-img"
                />
              </Link>
              <Card.Body className="camera-card-body">
                <Card.Title as="h2" className="camera-card-title">
                  {camera.model_name}
                </Card.Title>
                <div className="camera-card-meta">
                  <span className="camera-power">
                    {camera.power !== null ? `${camera.power.toFixed(1)} Вт` : '—'}
                  </span>
                  <span className="camera-res">{camera.resolution || 'Full HD'}</span>
                </div>
                {isSearching && (
                  <div className="similarity-badge">
                    Сходство: {(camera.score * 100).toFixed(1)}%
                  </div>
                )}
                <Link to={`/cameras/${camera.id}`} className="btn-detail-link">
                  Подробнее
                </Link>
              </Card.Body>
            </Card>
          ))}
      </div>
    </main>
  );
}
