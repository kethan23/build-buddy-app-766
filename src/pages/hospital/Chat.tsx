import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HospitalConversationList from '@/components/chat/HospitalConversationList';
import ChatInterface from '@/components/chat/ChatInterface';
import { MessageSquare } from 'lucide-react';

export default function HospitalChat() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | undefined>();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Patient Messages</h1>
          <p className="text-muted-foreground">
            Communicate with patients who have sent inquiries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <HospitalConversationList
              onSelect={setSelectedConversation}
              selectedId={selectedConversation}
            />
          </div>
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <ChatInterface conversationId={selectedConversation} />
            ) : (
              <div className="flex items-center justify-center h-[600px] border rounded-lg bg-muted/10">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a conversation to start chatting with a patient
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
