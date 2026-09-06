// Supabase Client Configuration

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

let supabase = null;

async function initSupabase() {
    try {
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return supabase;
    } catch (e) {
        console.warn('Supabase not loaded, running in demo mode');
        return null;
    }
}

export { supabase, initSupabase, SUPABASE_URL, SUPABASE_ANON_KEY };
