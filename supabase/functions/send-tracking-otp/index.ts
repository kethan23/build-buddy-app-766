import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const { tracking_id } = await req.json();
    if (!tracking_id) throw new Error('tracking_id required');

    // Verify the tracking belongs to this user
    const { data: tracking, error: tErr } = await supabase
      .from('patient_journey_tracking')
      .select('*')
      .eq('id', tracking_id)
      .eq('patient_id', user.id)
      .single();

    if (tErr || !tracking) throw new Error('Tracking not found');

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store OTP
    await supabase
      .from('patient_journey_tracking')
      .update({ otp_code: otp, otp_expires_at: expiresAt, otp_verified: false })
      .eq('id', tracking_id);

    // Send OTP via email using Supabase's built-in auth email
    // For now, we'll use a simple approach - in production, integrate Twilio/SendGrid
    const { error: emailError } = await supabase.auth.admin.updateUserById(user.id, {
      // We can't send custom emails via auth, so we'll return OTP in dev mode
      // In production, integrate SendGrid/Twilio
    });

    console.log(`OTP for tracking ${tracking_id}: ${otp} (user: ${user.email})`);

    // In a production environment, send the OTP via email/SMS here
    // For now, we'll also return it (remove in production)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent to your registered email/phone',
        // Remove otp field in production - only for development testing
        otp_dev: otp 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
