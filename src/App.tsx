import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { CameraCatalogPage } from './pages/CameraCatalogPage';
import { CameraFeedPage } from './pages/CameraFeedPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<CameraCatalogPage />} />
          <Route path="catalog" element={<CameraCatalogPage />} />
          <Route path="feed" element={<CameraFeedPage />} />
          <Route path="feed/:id" element={<CameraFeedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
