import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Check URL for error parameters first
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    
    const errorParam = hashParams.get('error') || queryParams.get('error');
    const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
    
    if (errorParam) {
      const friendlyError = errorDescription?.includes('expired') || errorDescription?.includes('invalid')
        ? 'This login link has expired or was already used. Please request a new one.'
        : (errorDescription || errorParam);
      setError(friendlyError);
      setIsProcessing(false);
      return;
    }

    // Set up auth state listener to handle the token exchange
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        
        if (event === 'SIGNED_IN' && session?.user) {
          setIsProcessing(false);
          
          // Clear the URL hash to prevent re-processing
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
          
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
              navigate('/patient/dashboard', { replace: true });
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          navigate('/auth', { replace: true });
        }
      }
    );

    // Also try to get existing session (in case auth state change already fired)
    const checkExistingSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setError(sessionError.message);
        setIsProcessing(false);
        return;
      }

      if (session?.user) {
        // Session exists, get role and redirect
        try {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          const role = roleData?.role || 'patient';
          if (role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else if (role === 'hospital') {
            navigate('/hospital/dashboard', { replace: true });
          } else {
            navigate('/patient/dashboard', { replace: true });
          }
        } catch (err) {
          navigate('/patient/dashboard', { replace: true });
        }
      }
    };

    // Small delay to let onAuthStateChange handle it first
    const sessionCheckTimeout = setTimeout(checkExistingSession, 500);

    // Set a timeout for if no auth event fires
    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setError('Authentication timed out. The link may have expired or was already used. Please request a new login link.');
          setIsProcessing(false);
        }
      });
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
      clearTimeout(sessionCheckTimeout);
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Authentication Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              Return to Sign In
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                navigate('/auth');
                // Small delay to let navigation happen, then switch to magic link mode
              }} 
              className="w-full"
            >
              Request New Magic Link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {isProcessing ? 'Completing sign in...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
