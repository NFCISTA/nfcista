const fs = require('fs');

async function checkProfile() {
  const res = await fetch('https://nfcista.vercel.app/p/demo-customer');
  const html = await res.text();
  console.log('Status:', res.status);
  console.log('Contains Portfolio & Products:', html.includes('Portfolio & Products') || html.includes('Portfolio &amp; Products'));
  
  const gMatch = html.match(/<section[^>]*aria-label="Portfolio and Products"[^>]*>([\s\S]*?)<\/section>/);
  if (gMatch) {
    console.log('--- Gallery Section HTML ---');
    console.log(gMatch[1]);
  } else {
    console.log('Gallery section not found in HTML. Check if any customer was created or what slug is used.');
  }

  // Check what get_customer_gallery returns for demo-customer
  const { createClient } = require('@supabase/supabase-js');
  const env = fs.readFileSync('.env.local', 'utf8');
  const getEnv = (k) => {
    const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
    return m ? m[1].trim() : null;
  };
  const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
  const { data, error } = await supabase.rpc('get_customer_gallery', { slug_input: 'demo-customer' });
  console.log('Supabase RPC get_customer_gallery("demo-customer"):', data, error);
}

checkProfile();
