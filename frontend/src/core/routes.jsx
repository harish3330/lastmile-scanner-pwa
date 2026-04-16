import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import PWAPage from '../modules/pwa/PWAPage';
import UIPage from '../modules/ui/UIPage';
import StoragePage from '../modules/storage/StoragePage';
import SyncPage from '../modules/sync/SyncPage';
import ScannerPage from '../modules/scanner/ScannerPage';
import CameraPage from '../modules/camera/CameraPage';
import GPSPage from '../modules/gps/GPSPage';
import GeofencePage from '../modules/geofence/GeofencePage';
import MLPage from '../modules/ml/MLPage';
import IntegrationsPage from '../modules/integrations/IntegrationsPage';
import NotFound from '../pages/NotFound';

const routes = (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/pwa" element={<PWAPage />} />
    <Route path="/ui" element={<UIPage />} />
    <Route path="/storage" element={<StoragePage />} />
    <Route path="/sync" element={<SyncPage />} />
    <Route path="/scanner" element={<ScannerPage />} />
    <Route path="/camera" element={<CameraPage />} />
    <Route path="/gps" element={<GPSPage />} />
    <Route path="/geofence" element={<GeofencePage />} />
    <Route path="/ml" element={<MLPage />} />
    <Route path="/integrations" element={<IntegrationsPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default routes;
