import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { CameraCard } from '../components/CameraCard';
import { PowerFilter } from '../components/PowerFilter';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  DEFAULT_MAX_POWER,
  applyPowerFilter,
  deleteCamera,
  fetchCameras,
  resetPowerFilter,
  setSliderPower,
} from '../slices/camerasSlice';
import './CameraCatalogPage.css';

export const CameraCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const { cameras, sliderPower, appliedPower, loading, actionLoading } = useAppSelector(
    (state) => state.cameras
  );

  useEffect(() => {
    document.title = 'Каталог камер - Расчет энергопотребления';
    const rawPower = searchParams.get('power');
    if (rawPower !== null) {
      const parsed = parseFloat(rawPower);
      if (Number.isFinite(parsed)) {
        dispatch(applyPowerFilter(parsed));
        dispatch(fetchCameras(parsed));
        return;
      }
    }
    dispatch(fetchCameras());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleCardClick = (id: number) => {
    navigate(`/feed/${id}`);
  };

  const handleDeleteCamera = (id: number) => {
    dispatch(deleteCamera(id));
  };

  const handleSearch = () => {
    dispatch(applyPowerFilter(sliderPower));
    if (sliderPower < DEFAULT_MAX_POWER) {
      setSearchParams({ power: sliderPower.toFixed(1) });
    } else {
      setSearchParams({});
    }
    dispatch(fetchCameras(sliderPower));
  };

  const handleResetFilter = () => {
    dispatch(resetPowerFilter());
    setSearchParams({});
    dispatch(fetchCameras(DEFAULT_MAX_POWER));
  };

  return (
    <div className="camera-catalog-page">
      <header className="catalog-header">
        <h1 className="catalog-title">Каталог камер</h1>
        <PowerFilter
          maxPower={DEFAULT_MAX_POWER}
          currentValue={sliderPower}
          onChange={(val) => {
            dispatch(setSliderPower(val));
          }}
          onSearch={handleSearch}
          loading={loading || actionLoading}
        />
      </header>

      <main className="catalog-grid-scroll">
        {loading ? (
          <div className="catalog-empty-state">
            <Spinner animation="border" variant="danger" />
          </div>
        ) : cameras.length === 0 ? (
          <div className="catalog-empty-state">
            <p>Нет камер с мощностью до {appliedPower.toFixed(1)} Вт</p>
            <Button
              type="button"
              bsPrefix="btn-reset-empty"
              onClick={handleResetFilter}
              disabled={loading || actionLoading}
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
              showDelete={isAuthenticated && camera.is_creator === 1}
              disabled={actionLoading}
            />
          ))
        )}
      </main>
    </div>
  );
};
