import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HospitalData {
  hospitalName?: string;
  city?: string;
  country?: string;
  phone?: string;
  description?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: 'patient' | 'hospital', hospitalData?: HospitalData) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      let errorMessage = error.message;
      
      // Provide more helpful error messages
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials or sign up if you don\'t have an account.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before signing in.';
      }
      
      toast({
        title: "Error signing in",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'patient' | 'hospital', hospitalData?: HospitalData) => {
    // Use the deployed URL for redirects to avoid localhost issues
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'https://preview--build-buddy-app-766.lovable.app'
      : window.location.origin;
    const redirectUrl = `${baseUrl}/auth/callback`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });
    
    if (error) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    // Create hospital record if hospital role using secure function
    if (role === 'hospital' && data.user && hospitalData) {
      console.log('Creating hospital profile for user:', data.user.id);
      console.log('Hospital data:', hospitalData);
      
      const { data: hospitalId, error: hospitalError } = await supabase
        .rpc('create_hospital_profile', {
          p_user_id: data.user.id,
          p_name: hospitalData.hospitalName || '',
          p_email: email,
          p_city: hospitalData.city || '',
          p_country: hospitalData.country || '',
          p_phone: hospitalData.phone || '',
          p_description: hospitalData.description || '',
        });

      if (hospitalError) {
        console.error('Hospital creation error:', hospitalError);
        toast({
          title: "Error creating hospital profile",
          description: hospitalError.message,
          variant: "destructive",
        });
        return { error: hospitalError };
      }

      console.log('Hospital created successfully with ID:', hospitalId);
      toast({
        title: "Hospital registration submitted!",
        description: "Your application is pending admin approval. You'll be notified once approved.",
      });
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    }
    
    return { error };
  };

  const signInWithGoogle = async () => {
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'https://preview--build-buddy-app-766.lovable.app'
      : window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
      },
    });
    
    if (error) {
      toast({
        title: "Error signing in with Google",
        description: error.message,
        variant: "destructive",
      });
    }
    
    return { error };
  };

  const signInWithMagicLink = async (email: string) => {
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'https://preview--build-buddy-app-766.lovable.app'
      : window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback`,
      },
    });
    
    if (error) {
      toast({
        title: "Error sending magic link",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Magic link sent!",
        description: "Check your email for the login link.",
      });
    }
    
    return { error };
  };

  const resetPassword = async (email: string) => {
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'https://preview--build-buddy-app-766.lovable.app'
      : window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/reset-password`,
    });
    
    if (error) {
      toast({
        title: "Error sending reset email",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reset email sent!",
        description: "Check your email for password reset instructions.",
      });
    }
    
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password updated!",
        description: "Your password has been successfully changed.",
      });
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      signIn, 
      signUp, 
      signInWithGoogle, 
      signInWithMagicLink, 
      resetPassword, 
      updatePassword, 
      signOut, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
