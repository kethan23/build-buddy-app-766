import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Building2 } from "lucide-react";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["patient", "hospital"]),
  // Hospital-specific fields
  hospitalName: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === "hospital") {
    return data.hospitalName && data.city && data.country && data.phone;
  }
  return true;
}, {
  message: "Hospital details are required",
  path: ["hospitalName"],
});

const magicLinkSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const Auth = () => {
  const { user, signIn, signUp, signInWithGoogle, signInWithMagicLink, resetPassword, loading } = useAuth();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "magic" | "reset">("signin");

  // Redirect based on user role
  useEffect(() => {
    const redirectBasedOnRole = async () => {
      if (user && !loading) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        const role = roleData?.role || 'patient';

        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'hospital') {
          navigate('/hospital/dashboard');
        } else {
          navigate('/patient/dashboard');
        }
      }
    };

    redirectBasedOnRole();
  }, [user, loading, navigate]);

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { 
      fullName: "", 
      email: "", 
      password: "", 
      confirmPassword: "",
      role: "patient",
      hospitalName: "",
      city: "",
      country: "",
      phone: "",
      description: "",
      acceptTerms: false,
    },
  });

  const selectedRole = signUpForm.watch("role");

  const magicLinkForm = useForm<z.infer<typeof magicLinkSchema>>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });

  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSignIn = async (values: z.infer<typeof signInSchema>) => {
    const { error } = await signIn(values.email, values.password);
    // Role-based redirect handled in useEffect
  };

  const onSignUp = async (values: z.infer<typeof signUpSchema>) => {
    const hospitalData = values.role === 'hospital' ? {
      hospitalName: values.hospitalName,
      city: values.city,
      country: values.country,
      phone: values.phone,
      description: values.description,
    } : undefined;

    await signUp(
      values.email, 
      values.password, 
      values.fullName, 
      values.role,
      hospitalData
    );
    // Role-based redirect handled in useEffect after user state updates
  };

  const onMagicLink = async (values: z.infer<typeof magicLinkSchema>) => {
    await signInWithMagicLink(values.email);
  };

  const onResetPassword = async (values: z.infer<typeof resetPasswordSchema>) => {
    await resetPassword(values.email);
    setAuthMode("signin");
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">MediConnect</CardTitle>
          <CardDescription className="text-center">
            {authMode === "signin" && "Sign in to your account"}
            {authMode === "signup" && "Create your account"}
            {authMode === "magic" && "Sign in with magic link"}
            {authMode === "reset" && "Reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authMode === "signin" && (
            <>
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="email@example.com" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={signInForm.formState.isSubmitting}>
                    {signInForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>

              <div className="mt-4 space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleSignIn}
                  type="button"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setAuthMode("magic")}
                  type="button"
                >
                  Sign in with Magic Link
                </Button>
              </div>

              <div className="mt-4 text-center space-y-2">
                <button
                  onClick={() => setAuthMode("reset")}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
                <div className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button onClick={() => setAuthMode("signup")} className="text-primary hover:underline">
                    Sign up
                  </button>
                </div>
              </div>
            </>
          )}

          {authMode === "signup" && (
            <>
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                  <FormField
                    control={signUpForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I am a</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="patient" id="patient" />
                              <Label htmlFor="patient" className="flex items-center cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                Patient
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="hospital" id="hospital" />
                              <Label htmlFor="hospital" className="flex items-center cursor-pointer">
                                <Building2 className="mr-2 h-4 w-4" />
                                Hospital
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedRole === "hospital" && (
                    <>
                      <FormField
                        control={signUpForm.control}
                        name="hospitalName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hospital Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="City Medical Center" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={signUpForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Input placeholder="Mumbai" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signUpForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country *</FormLabel>
                              <FormControl>
                                <Input placeholder="India" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={signUpForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 1234567890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signUpForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hospital Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Brief description of your hospital" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={signUpForm.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">
                            I accept the{" "}
                            <a href="/terms" className="text-primary hover:underline">
                              terms and conditions
                            </a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={signUpForm.formState.isSubmitting}>
                    {signUpForm.formState.isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </Form>

              <div className="mt-4 text-center">
                <div className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => setAuthMode("signin")} className="text-primary hover:underline">
                    Sign in
                  </button>
                </div>
              </div>
            </>
          )}

          {authMode === "magic" && (
            <>
              <Form {...magicLinkForm}>
                <form onSubmit={magicLinkForm.handleSubmit(onMagicLink)} className="space-y-4">
                  <FormField
                    control={magicLinkForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={magicLinkForm.formState.isSubmitting}>
                    {magicLinkForm.formState.isSubmitting ? "Sending..." : "Send Magic Link"}
                  </Button>
                </form>
              </Form>

              <div className="mt-4 text-center">
                <button onClick={() => setAuthMode("signin")} className="text-sm text-primary hover:underline">
                  Back to sign in
                </button>
              </div>
            </>
          )}

          {authMode === "reset" && (
            <>
              <Form {...resetPasswordForm}>
                <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-4">
                  <FormField
                    control={resetPasswordForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={resetPasswordForm.formState.isSubmitting}>
                    {resetPasswordForm.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </Form>

              <div className="mt-4 text-center">
                <button onClick={() => setAuthMode("signin")} className="text-sm text-primary hover:underline">
                  Back to sign in
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
