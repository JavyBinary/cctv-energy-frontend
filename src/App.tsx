import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CameraCatalogPage } from './pages/CameraCatalogPage';
import { CameraDetailPage } from './pages/CameraDetailPage';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<CameraCatalogPage />} />
        <Route path="/cameras/:id" element={<CameraDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
