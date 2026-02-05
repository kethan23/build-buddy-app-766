 import { useState, useEffect } from 'react';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import Navbar from '@/components/layout/Navbar';
 import Footer from '@/components/layout/Footer';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Avatar, AvatarFallback } from '@/components/ui/avatar';
 import { Badge } from '@/components/ui/badge';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Button } from '@/components/ui/button';
 import { 
   MessageSquare, Building2, HeadphonesIcon, 
   Clock, CheckCircle, AlertCircle, Loader2, Plus
 } from 'lucide-react';
 import { formatDistanceToNow } from 'date-fns';
 import ChatInterface from '@/components/chat/ChatInterface';
 import SupportChatView from '@/components/support/SupportChatView';
 import CreateSupportTicket from '@/components/support/CreateSupportTicket';
 
 interface HospitalConversation {
   id: string;
   type: 'hospital';
   hospital_id: string;
   hospital_name: string;
   last_message_at: string;
   status: string;
   unread_count: number;
 }
 
 interface SupportTicket {
   id: string;
   type: 'support';
   subject: string;
   category: string;
   priority: string;
   status: string;
   updated_at: string;
 }
 
 type InboxItem = HospitalConversation | SupportTicket;
 
 export default function PatientInbox() {
   const { user } = useAuth();
   const [conversations, setConversations] = useState<HospitalConversation[]>([]);
   const [tickets, setTickets] = useState<SupportTicket[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
   const [activeTab, setActiveTab] = useState('all');
 
   useEffect(() => {
     if (user) {
       fetchAllMessages();
       subscribeToUpdates();
     }
   }, [user]);
 
   const fetchAllMessages = async () => {
     setLoading(true);
     await Promise.all([fetchConversations(), fetchTickets()]);
     setLoading(false);
   };
 
   const fetchConversations = async () => {
     try {
       const { data, error } = await supabase
         .from('conversations')
         .select(`
           *,
           hospital:hospitals(name),
           messages(id, is_read, sender_id)
         `)
         .eq('patient_id', user?.id)
         .order('last_message_at', { ascending: false });
 
       if (error) throw error;
 
       const mapped = data?.map((conv: any) => ({
         id: conv.id,
         type: 'hospital' as const,
         hospital_id: conv.hospital_id,
         hospital_name: conv.hospital?.name || 'Unknown Hospital',
         last_message_at: conv.last_message_at,
         status: conv.status,
         unread_count: conv.messages?.filter((m: any) => !m.is_read && m.sender_id !== user?.id).length || 0,
       }));
 
       setConversations(mapped || []);
     } catch (error) {
       console.error('Error fetching conversations:', error);
     }
   };
 
   const fetchTickets = async () => {
     try {
       const { data, error } = await supabase
         .from('support_tickets')
         .select('*')
         .eq('user_id', user?.id)
         .order('updated_at', { ascending: false });
 
       if (error) throw error;
 
       const mapped = data?.map((ticket: any) => ({
         id: ticket.id,
         type: 'support' as const,
         subject: ticket.subject,
         category: ticket.category,
         priority: ticket.priority,
         status: ticket.status,
         updated_at: ticket.updated_at,
       }));
 
       setTickets(mapped || []);
     } catch (error) {
       console.error('Error fetching tickets:', error);
     }
   };
 
   const subscribeToUpdates = () => {
     const convChannel = supabase
       .channel('inbox-conversations')
       .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, fetchConversations)
       .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchConversations)
       .subscribe();
 
     const ticketChannel = supabase
       .channel('inbox-tickets')
       .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, fetchTickets)
       .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, fetchTickets)
       .subscribe();
 
     return () => {
       supabase.removeChannel(convChannel);
       supabase.removeChannel(ticketChannel);
     };
   };
 
   const getStatusIcon = (status: string) => {
     switch (status) {
       case 'open': return <AlertCircle className="h-4 w-4 text-warning" />;
       case 'in_progress': return <Clock className="h-4 w-4 text-primary" />;
       case 'resolved': return <CheckCircle className="h-4 w-4 text-success" />;
       default: return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
     }
   };
 
   const getPriorityColor = (priority: string): 'destructive' | 'default' | 'secondary' | 'outline' => {
     switch (priority) {
       case 'urgent': return 'destructive';
       case 'high': return 'default';
       case 'normal': return 'secondary';
       default: return 'outline';
     }
   };
 
   const getAllItems = (): InboxItem[] => {
     const all: InboxItem[] = [
       ...conversations,
       ...tickets,
     ];
     return all.sort((a, b) => {
       const dateA = a.type === 'hospital' ? a.last_message_at : a.updated_at;
       const dateB = b.type === 'hospital' ? b.last_message_at : b.updated_at;
       return new Date(dateB).getTime() - new Date(dateA).getTime();
     });
   };
 
   const getFilteredItems = (): InboxItem[] => {
     if (activeTab === 'hospitals') return conversations;
     if (activeTab === 'support') return tickets;
     return getAllItems();
   };
 
   const renderItemCard = (item: InboxItem) => {
     const isSelected = selectedItem?.id === item.id;
     const isHospital = item.type === 'hospital';
 
     return (
       <button
         key={item.id}
         onClick={() => setSelectedItem(item)}
         className={`w-full text-left p-4 rounded-lg transition-colors border ${
           isSelected
             ? 'bg-primary/10 border-primary/30'
             : 'hover:bg-muted border-transparent'
         }`}
       >
         <div className="flex items-start gap-3">
           <Avatar className={`h-10 w-10 ${isHospital ? 'bg-primary/10' : 'bg-accent/20'}`}>
             <AvatarFallback className={isHospital ? 'text-primary' : 'text-accent-foreground'}>
               {isHospital ? <Building2 className="h-5 w-5" /> : <HeadphonesIcon className="h-5 w-5" />}
             </AvatarFallback>
           </Avatar>
           <div className="flex-1 min-w-0">
             <div className="flex items-center justify-between mb-1">
               <h4 className="font-semibold text-sm truncate">
                 {isHospital ? item.hospital_name : item.subject}
               </h4>
               {isHospital && item.unread_count > 0 && (
                 <Badge variant="default" className="ml-2 text-xs">
                   {item.unread_count}
                 </Badge>
               )}
             </div>
             <div className="flex items-center gap-2 mb-1">
               <Badge variant="outline" className="text-xs">
                 {isHospital ? 'Hospital' : item.category}
               </Badge>
               {!isHospital && (
                 <Badge variant={getPriorityColor(item.priority)} className="text-xs">
                   {item.priority}
                 </Badge>
               )}
             </div>
             <div className="flex items-center gap-2 text-xs text-muted-foreground">
               {!isHospital && getStatusIcon(item.status)}
               <span>
                 {formatDistanceToNow(new Date(isHospital ? item.last_message_at : item.updated_at), {
                   addSuffix: true,
                 })}
               </span>
             </div>
           </div>
         </div>
       </button>
     );
   };
 
   if (loading) {
     return (
       <div className="min-h-screen flex flex-col">
         <Navbar />
         <main className="flex-1 flex items-center justify-center">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </main>
         <Footer />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen flex flex-col">
       <Navbar />
       <main className="flex-1 container mx-auto px-4 py-8">
         <div className="flex items-center justify-between mb-6">
           <div>
             <h1 className="text-3xl font-bold gradient-text">Inbox</h1>
             <p className="text-muted-foreground mt-1">
               All your conversations in one place
             </p>
           </div>
           <CreateSupportTicket
             trigger={
               <Button className="gap-2">
                 <Plus className="h-4 w-4" />
                 New Support Ticket
               </Button>
             }
             onCreated={fetchTickets}
           />
         </div>
 
         <div className="grid lg:grid-cols-3 gap-6">
           {/* Inbox List */}
           <Card className="lg:col-span-1">
             <CardHeader className="pb-3">
               <Tabs value={activeTab} onValueChange={setActiveTab}>
                 <TabsList className="grid w-full grid-cols-3">
                   <TabsTrigger value="all" className="text-xs">
                     All ({getAllItems().length})
                   </TabsTrigger>
                   <TabsTrigger value="hospitals" className="text-xs">
                     <Building2 className="h-3 w-3 mr-1" />
                     ({conversations.length})
                   </TabsTrigger>
                   <TabsTrigger value="support" className="text-xs">
                     <HeadphonesIcon className="h-3 w-3 mr-1" />
                     ({tickets.length})
                   </TabsTrigger>
                 </TabsList>
               </Tabs>
             </CardHeader>
             <CardContent className="p-0">
               <ScrollArea className="h-[550px]">
                 <div className="space-y-1 p-2">
                   {getFilteredItems().length === 0 ? (
                     <div className="p-8 text-center">
                       <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                       <h3 className="font-semibold mb-2">No messages yet</h3>
                       <p className="text-sm text-muted-foreground">
                         {activeTab === 'hospitals' 
                           ? 'Send an inquiry to start chatting with hospitals'
                           : activeTab === 'support'
                           ? 'Create a support ticket for help'
                           : 'Your conversations will appear here'}
                       </p>
                     </div>
                   ) : (
                     getFilteredItems().map(renderItemCard)
                   )}
                 </div>
               </ScrollArea>
             </CardContent>
           </Card>
 
           {/* Chat View */}
           <Card className="lg:col-span-2">
             {selectedItem ? (
               selectedItem.type === 'hospital' ? (
                 <ChatInterface conversationId={selectedItem.id} />
               ) : (
                 <SupportChatView
                   ticketId={selectedItem.id}
                   onBack={() => setSelectedItem(null)}
                 />
               )
             ) : (
               <div className="flex flex-col items-center justify-center h-[600px] text-center p-8">
                 <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                 <h3 className="text-xl font-semibold mb-2">Select a Conversation</h3>
                 <p className="text-muted-foreground max-w-md">
                   Choose a conversation from the list to view messages from hospitals or support tickets.
                 </p>
               </div>
             )}
           </Card>
         </div>
       </main>
       <Footer />
     </div>
   );
 }