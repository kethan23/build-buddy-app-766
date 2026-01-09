import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Paperclip, Video, FileText, Image, Download, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  message_type: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
  is_read: boolean;
}

interface ChatInterfaceProps {
  conversationId: string;
  onVideoCall?: () => void;
}

interface ConversationInfo {
  patient_id: string;
  hospital_id: string;
  patient_name?: string;
  hospital_name?: string;
  patient_patient_id?: string;
}

interface PendingFile {
  file: File;
  preview?: string;
}

export default function ChatInterface({ conversationId, onVideoCall }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationInfo, setConversationInfo] = useState<ConversationInfo | null>(null);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConversationInfo();
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversationId]);

  const fetchConversationInfo = async () => {
    try {
      const { data: conv, error } = await supabase
        .from('conversations')
        .select('patient_id, hospital_id')
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      const [patientResult, hospitalResult] = await Promise.all([
        supabase.from('profiles').select('full_name, patient_id').eq('user_id', conv.patient_id).single(),
        supabase.from('hospitals').select('name').eq('id', conv.hospital_id).single()
      ]);

      setConversationInfo({
        patient_id: conv.patient_id,
        hospital_id: conv.hospital_id,
        patient_name: patientResult.data?.full_name,
        hospital_name: hospitalResult.data?.name,
        patient_patient_id: patientResult.data?.patient_id || undefined,
      });
    } catch (error) {
      console.error('Error fetching conversation info:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive',
      });
      return;
    }

    // Create preview for images
    let preview: string | undefined;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    setPendingFile({ file, preview });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePendingFile = () => {
    if (pendingFile?.preview) {
      URL.revokeObjectURL(pendingFile.preview);
    }
    setPendingFile(null);
  };

  const uploadFile = async (file: File): Promise<{ url: string; path: string } | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${conversationId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('medical-documents')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('medical-documents')
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, path: data.path };
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !pendingFile) || !user) return;

    setSending(true);
    setUploading(!!pendingFile);

    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;
      let messageType = 'text';

      // Upload file if present
      if (pendingFile) {
        const result = await uploadFile(pendingFile.file);
        if (result) {
          fileUrl = result.url;
          fileName = pendingFile.file.name;
          fileSize = pendingFile.file.size;
          messageType = pendingFile.file.type.startsWith('image/') ? 'image' : 'file';
        }
      }

      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: newMessage.trim() || fileName || 'Sent a file',
        message_type: messageType,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
      });

      if (error) throw error;
      
      setNewMessage('');
      removePendingFile();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const isImageFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  const isPatient = user?.id === conversationInfo?.patient_id;
  const otherPartyName = isPatient 
    ? conversationInfo?.hospital_name 
    : conversationInfo?.patient_name;

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div>
          <h3 className="font-semibold">{otherPartyName || 'Conversation'}</h3>
          {!isPatient && conversationInfo?.patient_patient_id && (
            <p className="text-xs text-muted-foreground font-mono">
              {conversationInfo.patient_patient_id}
            </p>
          )}
        </div>
        {onVideoCall && (
          <Button size="sm" variant="outline" onClick={onVideoCall}>
            <Video className="h-4 w-4 mr-2" />
            Video Call
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            const senderName = isOwn 
              ? 'You' 
              : (message.sender_id === conversationInfo?.patient_id 
                  ? conversationInfo?.patient_name?.split(' ')[0] || 'Patient'
                  : conversationInfo?.hospital_name?.split(' ')[0] || 'Hospital');
            
            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                    {senderName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col ${isOwn ? 'items-end' : ''} max-w-[70%]`}>
                  {/* File/Image attachment */}
                  {message.file_url && (
                    <div className={`mb-1 ${isOwn ? 'ml-auto' : ''}`}>
                      {message.message_type === 'image' && isImageFile(message.file_name || '') ? (
                        <a href={message.file_url} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={message.file_url} 
                            alt={message.file_name || 'Image'} 
                            className="max-w-xs rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        </a>
                      ) : (
                        <a
                          href={message.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 p-3 rounded-lg border ${
                            isOwn ? 'bg-primary/10' : 'bg-muted'
                          } hover:bg-muted/80 transition-colors`}
                        >
                          {getFileIcon(message.file_name || '')}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{message.file_name}</p>
                            {message.file_size && (
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(message.file_size)}
                              </p>
                            )}
                          </div>
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </a>
                      )}
                    </div>
                  )}
                  
                  {/* Text content */}
                  {message.content && message.content !== message.file_name && message.content !== 'Sent a file' && (
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  )}
                  
                  <span className="text-xs text-muted-foreground mt-1">
                    {format(new Date(message.created_at), 'HH:mm')}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Pending file preview */}
      {pendingFile && (
        <div className="px-4 py-2 border-t bg-muted/30">
          <div className="flex items-center gap-2 p-2 bg-background rounded-lg border">
            {pendingFile.preview ? (
              <img src={pendingFile.preview} alt="Preview" className="h-12 w-12 object-cover rounded" />
            ) : (
              <div className="h-12 w-12 flex items-center justify-center bg-muted rounded">
                {getFileIcon(pendingFile.file.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{pendingFile.file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(pendingFile.file.size)}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={removePendingFile} disabled={uploading}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
          />
          <Button 
            size="icon" 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || uploading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={sending || (!newMessage.trim() && !pendingFile)}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}