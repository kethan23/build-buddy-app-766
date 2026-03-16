import { ReactNode } from 'react';
import AgentSidebar from './AgentSidebar';

const AgentLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AgentLayout;
