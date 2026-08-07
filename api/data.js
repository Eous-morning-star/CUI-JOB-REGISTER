import { kv } from '@vercel/kv';

const VALID_MODULES = ['scaffold', 'insulation'];

export default async function handler(req, res) {
  const module = req.query.module;

  if (!VALID_MODULES.includes(module)) {
    return res.status(400).json({ error: 'Invalid or missing module. Use "scaffold" or "insulation".' });
  }

  const key = `${module}-jobs`;

  try {
    if (req.method === 'GET') {
      const value = await kv.get(key);
      return res.status(200).json({ value: value || [] });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || !Array.isArray(body.data)) {
        return res.status(400).json({ error: 'Request body must be { data: [...] }' });
      }
      await kv.set(key, body.data);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error('KV error:', err);
    return res.status(500).json({ error: 'Storage operation failed' });
  }
}
