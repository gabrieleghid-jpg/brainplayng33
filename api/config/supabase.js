/**
 * backend/config/supabase.js
 * Inizializza il client Supabase lato server (usa la SERVICE_ROLE_KEY)
 * ⚠️  La SERVICE_ROLE_KEY bypassa le RLS - usarla SOLO nel backend, mai nel frontend
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');
const {
  hasValidSupabaseUrl,
  hasValidSupabaseServiceRoleKey
} = require('../utils/env');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseConfigured = hasValidSupabaseUrl() && hasValidSupabaseServiceRoleKey();

const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

module.exports = { supabase, supabaseConfigured };
