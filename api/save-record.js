// api/save-record.js (Vercel Edge Function)
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));

    const n8nResp = await fetch(
      // 有効化済みなら /webhook/ を使う。未有効テストは /webhook-test/
      'https://n8n.srv1038507.hstgr.cloud/webhook/save-diet-record',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const text = await n8nResp.text();
    // n8nの応答がJSONじゃない場合もあるので安全に返す
    const payload = (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })();

    if (!n8nResp.ok) {
      return new Response(JSON.stringify({ error: `n8n returned ${n8nResp.status}`, data: payload }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data: payload }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
