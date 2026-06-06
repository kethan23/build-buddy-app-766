import { Navigate } from 'react-router-dom';

// Consolidated into /patient/inbox (support tickets tab) to remove duplicate UIs.
export default function PatientSupport() {
  return <Navigate to="/patient/inbox" replace />;
}
