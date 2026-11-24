import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { CameraCatalogPage } from './pages/CameraCatalogPage';
import { CameraFeedPage } from './pages/CameraFeedPage';
import { CameraCreatePage } from './pages/CameraCreatePage';
import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
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
