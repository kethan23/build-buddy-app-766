import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener to handle the token exchange
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth callback event:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer the role fetch to avoid deadlock
          setTimeout(async () => {
            try {
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .single();

              const role = roleData?.role || 'patient';

              // Redirect based on role
              if (role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
              } else if (role === 'hospital') {
                navigate('/hospital/dashboard', { replace: true });
              } else {
                navigate('/patient/dashboard', { replace: true });
              }
            } catch (err) {
              console.error('Error fetching role:', err);
              navigate('/patient/dashboard', { replace: true });
            }
          }, 0);
        } else if (event === 'TOKEN_REFRESHED') {
          // Token refreshed, session is valid
        } else if (event === 'SIGNED_OUT') {
          navigate('/auth', { replace: true });
        }
      }
    );

    // Check URL for error parameters
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorParam = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    if (errorParam) {
      setError(errorDescription || errorParam);
      return;
    }

    // Also check query params for errors
    const queryParams = new URLSearchParams(window.location.search);
    const queryError = queryParams.get('error');
    const queryErrorDesc = queryParams.get('error_description');
    
    if (queryError) {
      setError(queryErrorDesc || queryError);
      return;
    }

    // Set a timeout for if no auth event fires
    const timeout = setTimeout(() => {
      // Check if we have a session already
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setError('Authentication timed out. The link may have expired.');
        }
      });
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <button 
            onClick={() => navigate('/auth')} 
            className="text-primary hover:underline"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
