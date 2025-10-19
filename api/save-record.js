export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('Received data:', req.body);
    
    const n8nResponse = await fetch(
      'https://n8n.srv1038507.hstgr.cloud/webhook/save-diet-record',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      }
    );

    if (!n8nResponse.ok) {
      console.error('n8n error:', n8nResponse.status);
      res.status(500).json({ error: `n8n returned ${n8nResponse.status}` });
      return;
    }

    const data = await n8nResponse.json().catch(() => ({ success: true }));
    console.log('n8n response:', data);
    
    res.status(200).json({ success: true, message: 'Data saved successfully', data });
    
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
}
