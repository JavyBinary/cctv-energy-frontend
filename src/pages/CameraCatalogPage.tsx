import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CameraCard } from '../components/CameraCard';
import { PowerFilter } from '../components/PowerFilter';
import { getPublishedCameras } from '../modules/mock';
import './CameraCatalogPage.css';

const DEFAULT_MAX_POWER = 15.0;

export const CameraCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPower = searchParams.get('power') ? parseFloat(searchParams.get('power')!) : DEFAULT_MAX_POWER;

  const [sliderPower, setSliderPower] = useState<number>(initialPower);
  const [appliedPower, setAppliedPower] = useState<number>(initialPower);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

  useEffect(() => {
    document.title = 'Каталог камер - Расчет энергопотребления';
  }, []);

  // Filter cameras by applied power and exclude deleted
  const allPublished = getPublishedCameras(appliedPower);
  const cameras = allPublished.filter((c) => !deletedIds.includes(c.id));

  const handleCardClick = (id: number) => {
    navigate(`/feed/${id}`);
  };

  const handleDeleteCamera = (id: number) => {
    setDeletedIds((prev) => [...prev, id]);
  };

  const handleSearch = () => {
    setAppliedPower(sliderPower);
  };

  const handleResetFilter = () => {
    setSliderPower(DEFAULT_MAX_POWER);
    setAppliedPower(DEFAULT_MAX_POWER);
    setDeletedIds([]);
  };

  return (
    <div className="camera-catalog-page">
      <header className="catalog-header">
        <h1 className="catalog-title">Каталог камер</h1>
        <PowerFilter
          maxPower={DEFAULT_MAX_POWER}
          currentValue={sliderPower}
          onChange={(val) => {
            setSliderPower(val);
            setAppliedPower(val); // Real-time feedback and search button both work seamlessly
          }}
          onSearch={handleSearch}
        />
      </header>

      {/* Сетка плитки: 2 колонки со скроллом */}
      <main className="catalog-grid-scroll">
        {cameras.length === 0 ? (
          <div className="catalog-empty-state">
            <p>Нет камер с мощностью до {appliedPower.toFixed(1)} Вт</p>
            <button
              type="button"
              className="btn-reset-empty"
              onClick={handleResetFilter}
            >
              Сбросить фильтр
            </button>
          </div>
        ) : (
          cameras.map((camera) => (
            <CameraCard
              key={camera.id}
              camera={camera}
              onClick={handleCardClick}
              onDelete={handleDeleteCamera}
            />
          ))
        )}
      </main>
    </div>
  );
};
