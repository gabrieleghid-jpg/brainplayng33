function looksLikePlaceholder(value) {
  if (!value) return true;
  const v = String(value).trim();
  if (!v) return true;
  return (
    /XXXXXXXXXXXXXXXX/i.test(v) ||
    /\byour_[a-z0-9_]+_here\b/i.test(v) ||
    /\bchangeme\b/i.test(v) ||
    /\bexample\b/i.test(v)
  );
}

function hasValidAnthropicKey() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (looksLikePlaceholder(key)) return false;
  // Anthropic keys usually start with sk-ant-
  if (!String(key).startsWith('sk-ant-')) return false;
  return String(key).length >= 20;
}

function hasValidSupabaseUrl() {
  const url = process.env.SUPABASE_URL;
  if (looksLikePlaceholder(url)) return false;
  const v = String(url);
  return v.startsWith('https://') && v.includes('.supabase.co');
}

function hasValidSupabaseAnonKey() {
  const key = process.env.SUPABASE_ANON_KEY;
  if (looksLikePlaceholder(key)) return false;
  return String(key).length >= 20;
}

function hasValidSupabaseServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (looksLikePlaceholder(key)) return false;
  return String(key).length >= 20;
}

module.exports = {
  looksLikePlaceholder,
  hasValidAnthropicKey,
  hasValidSupabaseUrl,
  hasValidSupabaseAnonKey,
  hasValidSupabaseServiceRoleKey
};

