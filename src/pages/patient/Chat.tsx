import { Navigate } from 'react-router-dom';

// Consolidated into /patient/inbox to remove duplicate messaging UIs.
export default function Chat() {
  return <Navigate to="/patient/inbox" replace />;
}
