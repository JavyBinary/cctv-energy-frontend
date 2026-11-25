import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { CameraCatalogPage } from './pages/CameraCatalogPage';
import { CameraFeedPage } from './pages/CameraFeedPage';
import { CameraCreatePage } from './pages/CameraCreatePage';
import { LoginPage } from './pages/LoginPage';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchFeedBatch } from './slices/feedBatchSlice';

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const { status: batchStatus, forAuthenticated } = useAppSelector((state) => state.feedBatch);

  // Лента сессии в Redis формируется сразу при загрузке приложения (и перечитывается при входе/выходе)
  useEffect(() => {
    if (batchStatus === 'loading') return;
    if (batchStatus === 'idle' || forAuthenticated !== isAuthenticated) {
      dispatch(fetchFeedBatch({ refresh: false, authenticated: isAuthenticated }));
    }
  }, [dispatch, isAuthenticated, batchStatus, forAuthenticated]);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<CameraCatalogPage />} />
          <Route path="catalog" element={<CameraCatalogPage />} />
          <Route path="feed" element={<CameraFeedPage />} />
          <Route path="feed/:id" element={<CameraFeedPage />} />
          <Route path="create" element={<CameraCreatePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
