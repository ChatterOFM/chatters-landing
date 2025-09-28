// netlify/functions/counter.mjs
import { getStore } from '@netlify/blobs';

const START_TOTAL = 12389493.29; // one-time boot value

const cors = (json = false) => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  ...(json ? { 'Content-Type': 'application/json; charset=utf-8' } : {})
});

export async function handler(event) {
  const store = getStore('revenue'); // blob bucket

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors(), body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      const saved = await store.get('total', { type: 'json' });
      const total = saved?.total ?? START_TOTAL;
      return { statusCode: 200, headers: cors(true), body: JSON.stringify({ total }) };
    }

    if (event.httpMethod === 'POST') {
      const { delta = 0 } = JSON.parse(event.body || '{}');
      const current = (await store.get('total', { type: 'json' }))?.total ?? START_TOTAL;
      const updated = +(current + Number(delta)).toFixed(2);
      await store.set('total', JSON.stringify({ total: updated }));
      return { statusCode: 200, headers: cors(true), body: JSON.stringify({ total: updated }) };
    }

    return { statusCode: 405, headers: cors(), body: 'Method Not Allowed' };
  } catch (e) {
    return { statusCode: 500, headers: cors(true), body: JSON.stringify({ error: e.message }) };
  }
}
