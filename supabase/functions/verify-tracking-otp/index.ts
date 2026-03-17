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

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const { tracking_id, otp } = await req.json();
    if (!tracking_id || !otp) throw new Error('tracking_id and otp required');

    // Get tracking record
    const { data: tracking, error: tErr } = await supabase
      .from('patient_journey_tracking')
      .select('*')
      .eq('id', tracking_id)
      .eq('patient_id', user.id)
      .single();

    if (tErr || !tracking) throw new Error('Tracking not found');

    // Check OTP
    if (tracking.otp_code !== otp) {
      return new Response(
        JSON.stringify({ verified: false, message: 'Invalid OTP' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiry
    if (new Date(tracking.otp_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ verified: false, message: 'OTP expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark as verified
    await supabase
      .from('patient_journey_tracking')
      .update({ otp_verified: true, otp_code: null })
      .eq('id', tracking_id);

    return new Response(
      JSON.stringify({ verified: true, message: 'OTP verified successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
