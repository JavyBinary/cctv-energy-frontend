import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from 'react-redux';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { CameraCard } from '../components/CameraCard';
import { Pagination } from '../components/Pagination';
import { PowerFilter } from '../components/PowerFilter';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { RootState } from '../store';
import {
  DEFAULT_MAX_POWER,
  applyPowerFilter,
  deleteCamera,
  fetchCameras,
  resetPowerFilter,
  setCurrentPage,
  setSliderPower,
} from '../slices/camerasSlice';
import './CameraCatalogPage.css';

export const CameraCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const { cameras, total, currentPage, limit, sliderPower, appliedPower, loading, actionLoading } =
    useAppSelector((state) => state.cameras);

  const rawPower = searchParams.get('power');
  const parsedPower = rawPower !== null ? parseFloat(rawPower) : NaN;
  const urlPower = Number.isFinite(parsedPower) ? parsedPower : DEFAULT_MAX_POWER;

  const rawPage = searchParams.get('page');
  const parsedPage = rawPage !== null ? parseInt(rawPage, 10) : NaN;
  const urlPage = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const isRestoring = useRef(false);

  // Восстановление фильтра и страницы из Redux при возврате из Ленты на чистый /
  useEffect(() => {
    const saved = store.getState().cameras;
    const hasParams = searchParams.has('power') || searchParams.has('page');
    if (hasParams || (saved.appliedPower === DEFAULT_MAX_POWER && saved.currentPage === 1)) {
      return;
    }
    isRestoring.current = true;
    const nextParams: Record<string, string> = {};
    if (saved.appliedPower < DEFAULT_MAX_POWER) {
      nextParams.power = saved.appliedPower.toFixed(1);
    }
    if (saved.currentPage > 1) {
      nextParams.page = String(saved.currentPage);
    }
    setSearchParams(nextParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = 'Каталог камер - Расчет энергопотребления';
    if (isRestoring.current) {
      isRestoring.current = false;
      return;
    }
    dispatch(applyPowerFilter(urlPower));
    dispatch(setCurrentPage(urlPage));
    dispatch(fetchCameras({ powerMax: urlPower, page: urlPage }));
  }, [dispatch, urlPower, urlPage, isAuthenticated]);

  const handleCardClick = (id: number) => {
    navigate(`/feed/${id}`);
  };

  const handleDeleteCamera = (id: number) => {
    dispatch(deleteCamera(id));
  };

  const handleSearch = () => {
    dispatch(applyPowerFilter(sliderPower));
    if (sliderPower < DEFAULT_MAX_POWER) {
      setSearchParams({ power: sliderPower.toFixed(1), page: '1' });
    } else {
      setSearchParams({});
    }
  };

  const handleResetFilter = () => {
    dispatch(resetPowerFilter());
    setSearchParams({});
  };

  const handlePageChange = (nextPage: number) => {
    const nextParams: Record<string, string> = {};
    if (appliedPower < DEFAULT_MAX_POWER) {
      nextParams.power = appliedPower.toFixed(1);
    }
    if (nextPage > 1) {
      nextParams.page = String(nextPage);
    }
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

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

      {!loading && totalPages > 1 && (
        <div className="catalog-pagination-wrap">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};
