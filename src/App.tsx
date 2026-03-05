import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';

/* ─── lazy-loaded page components (code-splitting) ─── */
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Patients = lazy(() => import('./pages/Patients').then(m => ({ default: m.Patients })));
const PatientRegister = lazy(() => import('./pages/PatientRegister').then(m => ({ default: m.PatientRegister })));
const PatientDetail = lazy(() => import('./pages/PatientDetail').then(m => ({ default: m.PatientDetail })));
const Scheduling = lazy(() => import('./pages/Scheduling').then(m => ({ default: m.Scheduling })));
const Appointments = lazy(() => import('./pages/Appointments').then(m => ({ default: m.Appointments })));
const Triage = lazy(() => import('./pages/Triage').then(m => ({ default: m.Triage })));

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-3 border-surface-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Suspense fallback={<PageFallback />}><Dashboard /></Suspense>} />
        <Route path="/patients" element={<Suspense fallback={<PageFallback />}><Patients /></Suspense>} />
        <Route path="/patients/register" element={<Suspense fallback={<PageFallback />}><PatientRegister /></Suspense>} />
        <Route path="/patients/:id" element={<Suspense fallback={<PageFallback />}><PatientDetail /></Suspense>} />
        <Route path="/scheduling" element={<Suspense fallback={<PageFallback />}><Scheduling /></Suspense>} />
        <Route path="/appointments" element={<Suspense fallback={<PageFallback />}><Appointments /></Suspense>} />
        <Route path="/triage" element={<Suspense fallback={<PageFallback />}><Triage /></Suspense>} />
      </Route>
    </Routes>
  );
}

export default App;
