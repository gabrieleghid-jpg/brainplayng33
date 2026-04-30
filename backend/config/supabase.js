/**
 * backend/config/supabase.js
 * Inizializza il client Supabase lato server (usa la SERVICE_ROLE_KEY)
 * ⚠️  La SERVICE_ROLE_KEY bypassa le RLS - usarla SOLO nel backend, mai nel frontend
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERRORE: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti nel .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = supabase;
