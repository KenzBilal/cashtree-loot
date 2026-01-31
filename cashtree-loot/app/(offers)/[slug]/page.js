import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const dynamic = 'force-dynamic';

export default async function DebugPage({ params }) {
  const { slug } = params;
  
  // Construct the full URL version (since your DB has https://...)
  const fullLink = `https://cashttree.online/${slug}`;

  console.log(`[DEBUG] Searching for slug: ${slug}`);

  // 1. Try to fetch the campaign
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    // Search for EITHER 'motwal' OR the full link
    .or(`landing_url.eq.${slug},landing_url.eq.${fullLink}`);

  return (
    <div className="min-h-screen bg-black text-green-400 p-10 font-mono text-sm">
      <h1 className="text-2xl text-white mb-4">🕵️‍♂️ DEBUG MODE</h1>
      
      <div className="border border-gray-800 p-4 rounded mb-4">
        <p className="text-white font-bold">Search Parameters:</p>
        <p>Slug: <span className="text-yellow-400">{slug}</span></p>
        <p>Full Link Attempt: <span className="text-yellow-400">{fullLink}</span></p>
      </div>

      <div className="border border-gray-800 p-4 rounded">
        <p className="text-white font-bold">Database Result:</p>
        
        {/* CASE A: Database Error (RLS, Connection, etc) */}
        {error && (
          <div className="text-red-500 mt-2">
            <strong>❌ SUPABASE ERROR:</strong>
            <pre>{JSON.stringify(error, null, 2)}</pre>
            <p className="mt-2 text-gray-400">If code is "42501", you need to run the RLS Policies I sent you.</p>
          </div>
        )}

        {/* CASE B: Success but Empty (Data mismatch) */}
        {!error && (!data || data.length === 0) && (
          <div className="text-orange-500 mt-2">
            <strong>⚠️ NO DATA FOUND</strong>
            <p>Connection successful, but no rows matched.</p>
            <p>Check your table "landing_url" column exactly.</p>
          </div>
        )}

        {/* CASE C: Success! */}
        {data && data.length > 0 && (
          <div className="text-green-500 mt-2">
            <strong>✅ SUCCESS! FOUND {data.length} CAMPAIGN(S)</strong>
            <pre>{JSON.stringify(data[0], null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}