import React, { useState } from 'react';
import { CameraModel } from '../modules/types';
import { DEFAULT_IMAGE } from '../modules/mock';
import './CameraCard.css';

interface CameraCardProps {
  camera: CameraModel;
  onClick: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const CameraCard: React.FC<CameraCardProps> = ({ camera, onClick, onDelete }) => {
  const [imgSrc, setImgSrc] = useState(camera.image_url || DEFAULT_IMAGE);

  const handleImgError = () => {
    if (imgSrc !== DEFAULT_IMAGE) {
      setImgSrc(DEFAULT_IMAGE);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(camera.id);
    }
  };

  return (
    <div className="camera-card">
      <div
        className="camera-card-link"
        onClick={() => onClick(camera.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick(camera.id);
          }
        }}
      >
        <img
          src={imgSrc}
          alt={camera.model_name}
          className="camera-thumbnail"
          onError={handleImgError}
          loading="lazy"
        />
        <div className="camera-card-title">{camera.model_name}</div>
        <div className="camera-card-specs">
          <div className="camera-card-power">{camera.power.toFixed(1)} Вт</div>
          <div className="camera-card-resolution">{camera.resolution || '—'}</div>
          <div className="camera-card-likes">
            <svg width="17" height="15" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1.56479 2.39991C1.19694 2.93478 1.00001 3.56865 1 4.21779C1 5.55947 1.87507 6.55114 2.75013 7.42615L5.96338 10.5365C6.07366 10.66 6.20894 10.7585 6.36025 10.8257C6.51155 10.8928 6.67542 10.927 6.84095 10.926C7.00649 10.9249 7.1699 10.8887 7.32035 10.8196C7.47079 10.7505 7.60481 10.6503 7.71352 10.5254L10.9174 7.42615C11.7925 6.55114 12.6676 5.55363 12.6676 4.21779C12.6707 3.56722 12.4755 2.93115 12.1082 2.39421C11.7408 1.85728 11.2186 1.44496 10.6111 1.21212C10.0036 0.979291 9.33953 0.936993 8.70738 1.09086C8.07522 1.24472 7.50492 1.58745 7.07238 2.07343C7.04182 2.10611 7.00487 2.13216 6.96383 2.14997C6.92279 2.16778 6.87852 2.17697 6.83378 2.17697C6.78904 2.17697 6.74478 2.16778 6.70373 2.14997C6.66269 2.13216 6.62574 2.10611 6.59518 2.07343C6.16128 1.59059 5.59111 1.25072 4.95998 1.0987C4.32885 0.946681 3.66645 0.989671 3.06026 1.22199C2.45408 1.45431 1.93263 1.86503 1.56479 2.39991Z"
                fill="#D71820"
                stroke="#D71820"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span>{camera.likes_count}</span>
          </div>
        </div>
      </div>
      <div className="camera-card-delete-form">
        <button
          type="button"
          className="camera-card-delete-btn"
          title="Удалить камеру"
          onClick={handleDelete}
        >
          Удалить
        </button>
      </div>
    </div>
  );
};
