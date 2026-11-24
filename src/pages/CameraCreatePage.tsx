import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { DEFAULT_IMAGE, DEFAULT_VIDEO } from '../modules/mock';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  clearCameraError,
  createDraftCamera,
  fetchDraftCamera,
  publishCamera,
} from '../slices/camerasSlice';
import './CameraCreatePage.css';

export const CameraCreatePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const { draftCamera, loading, actionLoading, error } = useAppSelector((state) => state.cameras);

  // Шаг 1: создание черновика
  const [newModelName, setNewModelName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(DEFAULT_IMAGE);
  const [videoPreview, setVideoPreview] = useState<string>(DEFAULT_VIDEO);

  // Шаг 2: заполнение параметров черновика перед публикацией
  const [editModelName, setEditModelName] = useState('');
  const [power, setPower] = useState('');
  const [resolution, setResolution] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    document.title = 'Добавление камеры — Расчет энергопотребления';
    dispatch(clearCameraError());
    dispatch(fetchDraftCamera());
  }, [isAuthenticated, dispatch, navigate]);

  useEffect(() => {
    if (draftCamera) {
      setEditModelName(draftCamera.model_name || '');
      setPower(draftCamera.power ? String(draftCamera.power) : '');
      setResolution(draftCamera.resolution || '');
      setDescription(draftCamera.description || '');
    }
  }, [draftCamera]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
      if (videoPreview.startsWith('blob:')) URL.revokeObjectURL(videoPreview);
    };
  }, [imagePreview, videoPreview]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(DEFAULT_IMAGE);
    }
  };

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideoFile(file);
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoPreview(DEFAULT_VIDEO);
    }
  };

  const handleCreateDraft = async (e: FormEvent) => {
    e.preventDefault();
    if (!newModelName.trim()) return;
    await dispatch(
      createDraftCamera({
        model_name: newModelName.trim(),
        image_file: imageFile,
        video_file: videoFile,
      })
    );
  };

  const handlePublish = async (e: FormEvent) => {
    e.preventDefault();
    if (!draftCamera) return;
    const parsedPower = parseFloat(power);
    const result = await dispatch(
      publishCamera({
        cameraId: draftCamera.id,
        data: {
          model_name: editModelName.trim() || draftCamera.model_name,
          power: Number.isFinite(parsedPower) ? parsedPower : 0,
          resolution: resolution.trim() || 'Full HD',
          description: description.trim() || undefined,
        },
      })
    );
    if (publishCamera.fulfilled.match(result)) {
      navigate(`/feed/${result.payload.id}`);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="camera-create-page">
      <header className="create-header">
        <h1 className="create-heading">Добавить модель камеры</h1>
        <div className="create-status-badge">
          {draftCamera ? 'Черновик' : 'Новая камера'}
        </div>
      </header>

      <main className="create-content-scroll">
        {error && (
          <Alert variant="danger" className="create-alert">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="create-loading-box">
            <Spinner animation="border" variant="danger" />
          </div>
        ) : !draftCamera ? (
          <Form onSubmit={handleCreateDraft} className="create-form">
            <section className="create-media-section">
              <div className="create-media-card">
                <div className="create-media-header">
                  <span className="create-media-label">Фото камеры</span>
                </div>
                <div className="create-media-preview-box">
                  <img
                    src={imagePreview}
                    alt="Фото камеры"
                    className="create-media-preview-image"
                  />
                </div>
                <label className="create-media-upload-label" title="Выбрать файл изображения">
                  <input
                    type="file"
                    accept="image/*"
                    className="create-media-file-input"
                    onChange={handleImageChange}
                    disabled={actionLoading}
                  />
                  <span className="create-media-upload-btn-text">
                    {imageFile ? imageFile.name : 'Выбрать фото'}
                  </span>
                </label>
              </div>

              <div className="create-media-card">
                <div className="create-media-header">
                  <span className="create-media-label">Видео камеры</span>
                </div>
                <div className="create-media-preview-box">
                  <video
                    key={videoPreview}
                    className="create-media-preview-video"
                    poster={imagePreview}
                    controls
                    muted
                    loop
                    playsInline
                    src={videoPreview}
                  />
                </div>
                <label className="create-media-upload-label" title="Выбрать файл видео">
                  <input
                    type="file"
                    accept="video/*"
                    className="create-media-file-input"
                    onChange={handleVideoChange}
                    disabled={actionLoading}
                  />
                  <span className="create-media-upload-btn-text">
                    {videoFile ? videoFile.name : 'Выбрать видео'}
                  </span>
                </label>
              </div>
            </section>

            <section className="create-specs-group">
              <Form.Group controlId="create_model_name" className="create-field-item">
                <Form.Label className="create-field-label">Название модели</Form.Label>
                <Form.Control
                  type="text"
                  className="create-field-input"
                  placeholder="Например, DS-2CE16D8T-ITE"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  disabled={actionLoading}
                  required
                />
              </Form.Group>
            </section>

            <Button type="submit" bsPrefix="create-submit-btn" disabled={actionLoading}>
              {actionLoading ? <Spinner animation="border" size="sm" /> : 'Далее'}
            </Button>
          </Form>
        ) : (
          <Form onSubmit={handlePublish} className="create-form">
            <section className="create-media-section">
              <div className="create-media-card">
                <div className="create-media-header">
                  <span className="create-media-label">Фото камеры</span>
                </div>
                <div className="create-media-preview-box">
                  <img
                    src={draftCamera.image_url || DEFAULT_IMAGE}
                    alt="Фото камеры"
                    className="create-media-preview-image"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_IMAGE;
                    }}
                  />
                </div>
              </div>

              <div className="create-media-card">
                <div className="create-media-header">
                  <span className="create-media-label">Видео камеры</span>
                </div>
                <div className="create-media-preview-box">
                  <video
                    key={draftCamera.video_url || DEFAULT_VIDEO}
                    className="create-media-preview-video"
                    poster={draftCamera.image_url || DEFAULT_IMAGE}
                    controls
                    muted
                    loop
                    playsInline
                    src={draftCamera.video_url || DEFAULT_VIDEO}
                  />
                </div>
              </div>
            </section>

            <section className="create-specs-group">
              <Form.Group controlId="edit_model_name" className="create-field-item">
                <Form.Label className="create-field-label">Название модели</Form.Label>
                <Form.Control
                  type="text"
                  className="create-field-input"
                  value={editModelName}
                  onChange={(e) => setEditModelName(e.target.value)}
                  disabled={actionLoading}
                  required
                />
              </Form.Group>

              <Form.Group controlId="edit_power" className="create-field-item">
                <Form.Label className="create-field-label">Потребляемая мощность (Вт)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  step="0.1"
                  className="create-field-input"
                  placeholder="Например, 5.5"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                  disabled={actionLoading}
                  required
                />
              </Form.Group>

              <Form.Group controlId="edit_resolution" className="create-field-item">
                <Form.Label className="create-field-label">Разрешение</Form.Label>
                <Form.Control
                  type="text"
                  className="create-field-input"
                  placeholder="Например, Full HD"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  disabled={actionLoading}
                  required
                />
              </Form.Group>

              <Form.Group controlId="edit_description" className="create-field-item">
                <Form.Label className="create-field-label">Описание</Form.Label>
                <Form.Control
                  type="text"
                  className="create-field-input"
                  placeholder="Технические характеристики"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={actionLoading}
                  required
                />
              </Form.Group>
            </section>

            <Button type="submit" bsPrefix="create-submit-btn" disabled={actionLoading}>
              {actionLoading ? <Spinner animation="border" size="sm" /> : 'Опубликовать'}
            </Button>
          </Form>
        )}
      </main>
    </div>
  );
};
