import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { CameraCard } from '../components/CameraCard';
import { PowerFilter } from '../components/PowerFilter';
import { getPublishedCameras } from '../modules/mock';
import './CameraCatalogPage.css';

const DEFAULT_MAX_POWER = 15.0;

export const CameraCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPower = searchParams.get('power');
  const parsedPower = rawPower !== null ? parseFloat(rawPower) : NaN;
  const initialPower = Number.isFinite(parsedPower) ? parsedPower : DEFAULT_MAX_POWER;

  const [sliderPower, setSliderPower] = useState<number>(initialPower);
  const [appliedPower, setAppliedPower] = useState<number>(initialPower);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

  useEffect(() => {
    document.title = 'Каталог камер - Расчет энергопотребления';
  }, []);

  // Filter cameras by applied power (updated on form submit) and exclude deleted
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
    if (sliderPower < DEFAULT_MAX_POWER) {
      setSearchParams({ power: sliderPower.toFixed(1) });
    } else {
      setSearchParams({});
    }
  };

  const handleResetFilter = () => {
    setSliderPower(DEFAULT_MAX_POWER);
    setAppliedPower(DEFAULT_MAX_POWER);
    setDeletedIds([]);
    setSearchParams({});
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
          }}
          onSearch={handleSearch}
        />
      </header>

      {/* Сетка плитки: 2 колонки со скроллом */}
      <main className="catalog-grid-scroll">
        {cameras.length === 0 ? (
          <div className="catalog-empty-state">
            <p>Нет камер с мощностью до {appliedPower.toFixed(1)} Вт</p>
            <Button
              type="button"
              bsPrefix="btn-reset-empty"
              onClick={handleResetFilter}
            >
              Сбросить фильтр
            </Button>
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
