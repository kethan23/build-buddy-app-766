import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

export function AdminDebugInfo() {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [hasAdminRole, setHasAdminRole] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) return;

      console.log('Checking admin role for user:', user.id);

      // Check user_roles table
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
      } else {
        console.log('User roles:', roles);
        setUserRoles(roles || []);
      }

      // Check has_role function
      const { data: hasRole, error: hasRoleError } = await supabase
        .rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

      if (hasRoleError) {
        console.error('Error checking has_role:', hasRoleError);
      } else {
        console.log('has_role result:', hasRole);
        setHasAdminRole(hasRole);
      }
    };

    checkAdminRole();
  }, [user]);

  if (!user) return null;

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Admin Debug Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <strong>User ID:</strong> {user.id}
        </div>
        <div>
          <strong>Email:</strong> {user.email}
        </div>
        <div>
          <strong>Roles in user_roles table:</strong>{' '}
          {userRoles.length > 0 ? (
            <div className="flex gap-1 mt-1">
              {userRoles.map((role) => (
                <Badge key={role.id} variant={role.role === 'admin' ? 'default' : 'secondary'}>
                  {role.role}
                </Badge>
              ))}
            </div>
          ) : (
            <Badge variant="destructive">No roles found</Badge>
          )}
        </div>
        <div>
          <strong>has_role() check:</strong>{' '}
          {hasAdminRole === null ? (
            <Badge variant="secondary">Checking...</Badge>
          ) : hasAdminRole ? (
            <Badge className="bg-green-100 text-green-800">✓ Admin role confirmed</Badge>
          ) : (
            <Badge variant="destructive">✗ No admin role</Badge>
          )}
        </div>
        {(!hasAdminRole || userRoles.length === 0) && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800">
            <strong>⚠️ Issue Detected:</strong> This user does not have the admin role assigned.
            Admin privileges require a role entry in the user_roles table.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
