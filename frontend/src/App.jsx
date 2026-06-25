import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RCAViewer from './pages/RCAViewer';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rca/:runId" element={<RCAViewer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
