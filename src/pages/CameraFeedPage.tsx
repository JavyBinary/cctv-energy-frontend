import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCameraById, getNextCameraId, getPublishedCameras, DEFAULT_IMAGE, DEFAULT_VIDEO } from '../modules/mock';
import './CameraFeedPage.css';

export const CameraFeedPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [expandedDesc, setExpandedDesc] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesOffset, setLikesOffset] = useState(0);

  const published = getPublishedCameras();
  const defaultId = published.length > 0 ? published[0].id : 1;
  const currentId = id ? parseInt(id, 10) : defaultId;

  const camera = getCameraById(isNaN(currentId) ? defaultId : currentId) || published[0];

  useEffect(() => {
    // Reset video error and description state on camera change
    setVideoError(false);
    setExpandedDesc(false);
    setIsLiked(false);
    setLikesOffset(0);
    if (camera) {
      document.title = `${camera.model_name} - Лента камер`;
    }
  }, [currentId, camera]);

  const handleNextClick = () => {
    if (camera) {
      const nextId = getNextCameraId(camera.id);
      navigate(`/feed/${nextId}`);
    }
  };

  const handleLikeToggle = () => {
    setIsLiked((prev) => !prev);
    setLikesOffset((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  if (!camera) {
    return (
      <div className="feed-not-found">
        <p>Камера не найдена</p>
        <button type="button" className="btn-back" onClick={() => navigate('/')}>
          В каталог
        </button>
      </div>
    );
  }

  const effectiveLikes = camera.likes_count + likesOffset;
  const videoSrc = camera.video_url || DEFAULT_VIDEO;
  const imageSrc = camera.image_url || DEFAULT_IMAGE;

  return (
    <div className="camera-feed-container">
      {/* Медиа-контент: видео или фоллбек-изображение */}
      <div className="feed-video-container">
        {!videoError && videoSrc ? (
          <video
            key={camera.id}
            className="feed-video-player"
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
          />
        ) : (
          <img
            className="feed-video-player feed-image-fallback"
            src={imageSrc}
            alt={camera.model_name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_IMAGE;
            }}
          />
        )}
        <div className="feed-gradient-overlay" />
      </div>

      {/* Нижний информационный блок (название модели и описание с кнопкой Ещё / Свернуть) */}
      <section className="feed-info-block">
        <h2 className="feed-model-title">{camera.model_name}</h2>
        <div className={`feed-summary-row ${expandedDesc ? 'expanded' : ''}`}>
          <span className="feed-summary-text">
            {camera.description || 'Нет описания'}
          </span>
          {camera.description && camera.description.length > 30 && (
            <button
              type="button"
              className="feed-expand-btn"
              onClick={() => setExpandedDesc((prev) => !prev)}
            >
              {expandedDesc ? 'Свернуть' : 'Ещё'}
            </button>
          )}
        </div>
      </section>

      {/* Правая панель действий строго по image1.png */}
      <aside className="feed-side-actions">
        {/* 1. Лайк: Белое сердце + счетчик лайков снизу */}
        <div className="feed-like-action" onClick={handleLikeToggle} role="button" tabIndex={0}>
          <div className="feed-like-icon">
            <svg
              width="44"
              height="40"
              viewBox="0 0 14 12"
              fill={isLiked ? '#D71820' : '#FFFFFF'}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.56479 2.39991C1.19694 2.93478 1.00001 3.56865 1 4.21779C1 5.55947 1.87507 6.55114 2.75013 7.42615L5.96338 10.5365C6.07366 10.66 6.20894 10.7585 6.36025 10.8257C6.51155 10.8928 6.67542 10.927 6.84095 10.926C7.00649 10.9249 7.1699 10.8887 7.32035 10.8196C7.47079 10.7505 7.60481 10.6503 7.71352 10.5254L10.9174 7.42615C11.7925 6.55114 12.6676 5.55363 12.6676 4.21779C12.6707 3.56722 12.4755 2.93115 12.1082 2.39421C11.7408 1.85728 11.2186 1.44496 10.6111 1.21212C10.0036 0.979291 9.33953 0.936993 8.70738 1.09086C8.07522 1.24472 7.50492 1.58745 7.07238 2.07343C7.04182 2.10611 7.00487 2.13216 6.96383 2.14997C6.92279 2.16778 6.87852 2.17697 6.83378 2.17697C6.78904 2.17697 6.74478 2.16778 6.70373 2.14997C6.66269 2.13216 6.62574 2.10611 6.59518 2.07343C6.16128 1.59059 5.59111 1.25072 4.95998 1.0987C4.32885 0.946681 3.66645 0.989671 3.06026 1.22199C2.45408 1.45431 1.93263 1.86503 1.56479 2.39991Z"
                stroke={isLiked ? '#D71820' : '#FFFFFF'}
                strokeWidth="1.8"
                strokeLinecap="round"
                fill={isLiked ? '#D71820' : '#FFFFFF'}
              />
            </svg>
          </div>
          <div className="feed-likes-counter">{effectiveLikes}</div>
        </div>

        {/* 2. Круглая красная кнопка Следующий (#D71820) с белой стрелкой */}
        <button
          type="button"
          className="feed-next-button"
          onClick={handleNextClick}
          title="Следующая модель камеры"
          aria-label="Следующая модель камеры"
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5 12H19M19 12L13 6M19 12L13 18"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* 3. Овальные бейджи характеристик */}
        <div className="feed-metrics-badges">
          <div className="feed-metric-badge">{camera.power.toFixed(1)} Вт</div>
          <div className="feed-metric-badge">{camera.resolution || 'Full HD'}</div>
        </div>
      </aside>
    </div>
  );
};
