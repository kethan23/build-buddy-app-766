import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, GripVertical, Layers, FileText } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const ICON_OPTIONS = [
  'Activity', 'Brain', 'Bone', 'Heart', 'Eye', 'Baby', 'Stethoscope',
  'Smile', 'Scissors', 'Scale', 'Pill', 'Syringe',
];

const COLOR_OPTIONS = [
  { label: 'Orange', value: 'text-orange-500', bg: 'bg-orange-500/10' },
  { label: 'Purple', value: 'text-purple-500', bg: 'bg-purple-500/10' },
  { label: 'Blue', value: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Red', value: 'text-red-500', bg: 'bg-red-500/10' },
  { label: 'Cyan', value: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { label: 'Pink', value: 'text-pink-500', bg: 'bg-pink-500/10' },
  { label: 'Rose', value: 'text-rose-500', bg: 'bg-rose-500/10' },
  { label: 'Violet', value: 'text-violet-500', bg: 'bg-violet-500/10' },
  { label: 'Amber', value: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Emerald', value: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Teal', value: 'text-teal-500', bg: 'bg-teal-500/10' },
  { label: 'Green', value: 'text-green-500', bg: 'bg-green-500/10' },
  { label: 'Sky', value: 'text-sky-500', bg: 'bg-sky-500/10' },
  { label: 'Indigo', value: 'text-indigo-500', bg: 'bg-indigo-500/10' },
];

interface Category {
  id: string; name: string; description: string | null; icon_name: string;
  color_class: string; bg_class: string; display_order: number; is_active: boolean;
}

interface Listing {
  id: string; name: string; category_id: string | null; avg_cost: string | null;
  duration: string | null; savings: string | null; description: string | null;
  icon_bg: string; display_order: number; is_active: boolean;
}

const emptyCategory = { name: '', description: '', icon_name: 'Activity', color_class: 'text-primary', bg_class: 'bg-primary/10', display_order: 0, is_active: true };
const emptyListing = { name: '', category_id: '', avg_cost: '', duration: '', savings: '', description: '', icon_bg: 'bg-primary/10 text-primary', display_order: 0, is_active: true };

export default function AdminTreatments() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [catForm, setCatForm] = useState<any>(emptyCategory);
  const [listForm, setListForm] = useState<any>(emptyListing);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: cats }, { data: lsts }] = await Promise.all([
      supabase.from('treatment_categories').select('*').order('display_order'),
      supabase.from('treatment_listings').select('*').order('display_order'),
    ]);
    setCategories((cats as any) || []);
    setListings((lsts as any) || []);
    setLoading(false);
  };

  // ── Category CRUD ──
  const openCatEdit = (cat: Category) => {
    setCatForm({ name: cat.name, description: cat.description || '', icon_name: cat.icon_name, color_class: cat.color_class, bg_class: cat.bg_class, display_order: cat.display_order, is_active: cat.is_active });
    setEditingCatId(cat.id);
    setCatDialogOpen(true);
  };

  const saveCat = async () => {
    const payload = { ...catForm, display_order: Number(catForm.display_order) };
    if (editingCatId) {
      const { error } = await supabase.from('treatment_categories').update(payload).eq('id', editingCatId);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { error } = await supabase.from('treatment_categories').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    }
    toast({ title: editingCatId ? 'Category updated' : 'Category created' });
    setCatDialogOpen(false);
    setCatForm(emptyCategory);
    setEditingCatId(null);
    fetchAll();
  };

  const deleteCat = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await (supabase.from('treatment_categories') as any).delete().eq('id', id);
    toast({ title: 'Category deleted' });
    fetchAll();
  };

  // ── Listing CRUD ──
  const openListEdit = (lst: Listing) => {
    setListForm({ name: lst.name, category_id: lst.category_id || '', avg_cost: lst.avg_cost || '', duration: lst.duration || '', savings: lst.savings || '', description: lst.description || '', icon_bg: lst.icon_bg, display_order: lst.display_order, is_active: lst.is_active });
    setEditingListId(lst.id);
    setListDialogOpen(true);
  };

  const saveListing = async () => {
    const payload = { ...listForm, category_id: listForm.category_id || null, display_order: Number(listForm.display_order) };
    if (editingListId) {
      const { error } = await supabase.from('treatment_listings').update(payload).eq('id', editingListId);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { error } = await supabase.from('treatment_listings').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    }
    toast({ title: editingListId ? 'Listing updated' : 'Listing created' });
    setListDialogOpen(false);
    setListForm(emptyListing);
    setEditingListId(null);
    fetchAll();
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    await (supabase.from('treatment_listings') as any).delete().eq('id', id);
    toast({ title: 'Listing deleted' });
    fetchAll();
  };

  const toggleActive = async (table: string, id: string, current: boolean) => {
    await (supabase.from(table) as any).update({ is_active: !current }).eq('id', id);
    fetchAll();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl">Manage Treatments</h1>
            <p className="text-muted-foreground text-sm">Manage treatment categories and listings shown on the public treatments page</p>
          </div>
        </div>

        <Tabs defaultValue="categories">
          <TabsList className="mb-6">
            <TabsTrigger value="categories" className="gap-2"><Layers className="h-4 w-4" />Categories ({categories.length})</TabsTrigger>
            <TabsTrigger value="listings" className="gap-2"><FileText className="h-4 w-4" />Treatment Listings ({listings.length})</TabsTrigger>
          </TabsList>

          {/* ── CATEGORIES TAB ── */}
          <TabsContent value="categories">
            <div className="flex justify-end mb-4">
              <Dialog open={catDialogOpen} onOpenChange={(o) => { setCatDialogOpen(o); if (!o) { setCatForm(emptyCategory); setEditingCatId(null); } }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />Add Category</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>{editingCatId ? 'Edit' : 'Add'} Category</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Name</Label><Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Cardiology" /></div>
                    <div><Label>Description</Label><Textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} placeholder="Brief description" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Icon</Label>
                        <Select value={catForm.icon_name} onValueChange={(v) => setCatForm({ ...catForm, icon_name: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{ICON_OPTIONS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Color</Label>
                        <Select value={catForm.color_class} onValueChange={(v) => {
                          const match = COLOR_OPTIONS.find((c) => c.value === v);
                          setCatForm({ ...catForm, color_class: v, bg_class: match?.bg || 'bg-primary/10' });
                        }}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{COLOR_OPTIONS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Display Order</Label><Input type="number" value={catForm.display_order} onChange={(e) => setCatForm({ ...catForm, display_order: e.target.value })} /></div>
                      <div className="flex items-center gap-2 pt-6"><Switch checked={catForm.is_active} onCheckedChange={(v) => setCatForm({ ...catForm, is_active: v })} /><Label>Active</Label></div>
                    </div>
                    <Button onClick={saveCat} className="w-full">{editingCatId ? 'Update' : 'Create'} Category</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? <p className="text-muted-foreground text-center py-10">Loading...</p> : categories.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-muted-foreground">No categories yet. Click "Add Category" to create one.</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => (
                  <Card key={cat.id} className="border">
                    <CardContent className="flex items-center gap-4 py-3 px-4">
                      <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                      <div className={`w-10 h-10 rounded-xl ${cat.bg_class} flex items-center justify-center shrink-0`}>
                        <span className={`text-sm font-bold ${cat.color_class}`}>{cat.icon_name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{cat.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{cat.description || 'No description'}</p>
                      </div>
                      <Badge variant={cat.is_active ? 'default' : 'secondary'} className="text-xs">{cat.is_active ? 'Active' : 'Inactive'}</Badge>
                      <span className="text-xs text-muted-foreground">#{cat.display_order}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openCatEdit(cat)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteCat(cat.id)}><Trash2 className="h-4 w-4" /></Button>
                        <Switch checked={cat.is_active} onCheckedChange={() => toggleActive('treatment_categories', cat.id, cat.is_active)} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── LISTINGS TAB ── */}
          <TabsContent value="listings">
            <div className="flex justify-end mb-4">
              <Dialog open={listDialogOpen} onOpenChange={(o) => { setListDialogOpen(o); if (!o) { setListForm(emptyListing); setEditingListId(null); } }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />Add Treatment Listing</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>{editingListId ? 'Edit' : 'Add'} Treatment Listing</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Treatment Name</Label><Input value={listForm.name} onChange={(e) => setListForm({ ...listForm, name: e.target.value })} placeholder="e.g. Knee Replacement" /></div>
                    <div>
                      <Label>Category</Label>
                      <Select value={listForm.category_id} onValueChange={(v) => setListForm({ ...listForm, category_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Average Cost</Label><Input value={listForm.avg_cost} onChange={(e) => setListForm({ ...listForm, avg_cost: e.target.value })} placeholder="Starting $4,000" /></div>
                      <div><Label>Duration</Label><Input value={listForm.duration} onChange={(e) => setListForm({ ...listForm, duration: e.target.value })} placeholder="10-14 days" /></div>
                    </div>
                    <div><Label>Savings</Label><Input value={listForm.savings} onChange={(e) => setListForm({ ...listForm, savings: e.target.value })} placeholder="Save up to 80%" /></div>
                    <div><Label>Description</Label><Textarea value={listForm.description} onChange={(e) => setListForm({ ...listForm, description: e.target.value })} placeholder="Brief description" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Display Order</Label><Input type="number" value={listForm.display_order} onChange={(e) => setListForm({ ...listForm, display_order: e.target.value })} /></div>
                      <div className="flex items-center gap-2 pt-6"><Switch checked={listForm.is_active} onCheckedChange={(v) => setListForm({ ...listForm, is_active: v })} /><Label>Active</Label></div>
                    </div>
                    <Button onClick={saveListing} className="w-full">{editingListId ? 'Update' : 'Create'} Listing</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? <p className="text-muted-foreground text-center py-10">Loading...</p> : listings.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-muted-foreground">No treatment listings yet. Click "Add Treatment Listing" to create one.</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {listings.map((lst) => {
                  const cat = categories.find((c) => c.id === lst.category_id);
                  return (
                    <Card key={lst.id} className="border">
                      <CardContent className="flex items-center gap-4 py-3 px-4">
                        <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{lst.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {cat && <Badge variant="outline" className="text-[10px]">{cat.name}</Badge>}
                            {lst.avg_cost && <span>{lst.avg_cost}</span>}
                            {lst.duration && <span>• {lst.duration}</span>}
                          </div>
                        </div>
                        {lst.savings && <Badge variant="secondary" className="text-xs text-success shrink-0">{lst.savings}</Badge>}
                        <Badge variant={lst.is_active ? 'default' : 'secondary'} className="text-xs">{lst.is_active ? 'Active' : 'Inactive'}</Badge>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openListEdit(lst)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteListing(lst.id)}><Trash2 className="h-4 w-4" /></Button>
                          <Switch checked={lst.is_active} onCheckedChange={() => toggleActive('treatment_listings', lst.id, lst.is_active)} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
