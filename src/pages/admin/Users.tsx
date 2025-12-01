import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Search, User, Building2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Fetch profiles with roles
    const { data: profilesData } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(role)
      `)
      .order('created_at', { ascending: false });

    if (!profilesData) {
      setUsers([]);
      return;
    }

    // For each user, fetch their hospital info if they're a hospital user
    const usersWithHospitals = await Promise.all(
      profilesData.map(async (profile) => {
        const userRoles = Array.isArray(profile.user_roles) ? profile.user_roles : [];
        const isHospital = userRoles.some((r: any) => r.role === 'hospital');
        
        if (isHospital) {
          const { data: hospitalData } = await supabase
            .from('hospitals')
            .select('id, name, verification_status, created_at')
            .eq('user_id', profile.user_id)
            .single();
          
          return { ...profile, hospital: hospitalData };
        }
        
        return profile;
      })
    );

    setUsers(usersWithHospitals);
  };

  const filterUsers = (role?: string) => {
    let filtered = users;

    if (role) {
      filtered = filtered.filter(u => u.user_roles?.some((r: any) => r.role === role));
    }

    if (searchQuery) {
      filtered = filtered.filter(u =>
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getRoleIcon = (roles: any[]) => {
    const role = roles?.[0]?.role;
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'hospital':
        return <Building2 className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (roles: any[]) => {
    const role = roles?.[0]?.role || 'patient';
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      hospital: 'bg-blue-100 text-blue-800',
      patient: 'bg-green-100 text-green-800',
    };
    return <Badge className={colors[role as keyof typeof colors]}>{role}</Badge>;
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return null;
    }
  };

  const UserList = ({ role }: { role?: string }) => {
    const filtered = filterUsers(role);

    return (
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No users found
          </div>
        ) : (
          filtered.map((user) => (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-full bg-muted">
                      {getRoleIcon(user.user_roles || [])}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{user.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.phone && (
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                      )}
                      {user.hospital && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm font-medium text-primary">
                            Hospital: {user.hospital.name}
                          </p>
                          <div className="flex items-center gap-2">
                            {getVerificationBadge(user.hospital.verification_status)}
                            <span className="text-xs text-muted-foreground">
                              Registered: {new Date(user.hospital.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getRoleBadge(user.user_roles || [])}
                    {user.hospital && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate('/admin/hospitals')}
                      >
                        View Hospital
                      </Button>
                    )}
                  </div>
                </div>
                {user.country && !user.hospital && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {user.city}, {user.country}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground">
                View and manage platform users
              </p>
            </div>
            <Button onClick={() => navigate("/admin/create-admin")}>
              Create Admin User
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filterUsers('patient').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Hospitals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filterUsers('hospital').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filterUsers('admin').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="patient">Patients</TabsTrigger>
              <TabsTrigger value="hospital">Hospitals</TabsTrigger>
              <TabsTrigger value="admin">Admins</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <UserList />
            </TabsContent>
            <TabsContent value="patient">
              <UserList role="patient" />
            </TabsContent>
            <TabsContent value="hospital">
              <UserList role="hospital" />
            </TabsContent>
            <TabsContent value="admin">
              <UserList role="admin" />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUsers;
