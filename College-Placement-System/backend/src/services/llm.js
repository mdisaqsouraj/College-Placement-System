// Free-tier friendly LLM client. Tries providers in order and falls back automatically.
// Providers: groq (free), gemini (free), anthropic (paid, optional). Only providers whose key is set are used.
const defs = {
  groq: {
    key: 'GROQ_API_KEY',
    model: () => process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    req: (prompt, max, key, model) => ({ url: 'https://api.groq.com/openai/v1/chat/completions', headers: { authorization: `Bearer ${key}` }, body: { model, max_tokens: max, temperature: 0.8, messages: [{ role: 'user', content: prompt }] } }),
    text: (j) => j.choices?.[0]?.message?.content || '',
  },
  gemini: {
    key: 'GEMINI_API_KEY',
    model: () => process.env.GEMINI_MODEL || 'gemini-flash-latest',
    req: (prompt, max, key, model) => ({ url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, headers: { 'x-goog-api-key': key }, body: { contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: max, temperature: 0.8 } } }),
    text: (j) => (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join(''),
  },
  anthropic: {
    key: 'ANTHROPIC_API_KEY',
    model: () => process.env.AI_MODEL || 'claude-haiku-5-5',
    req: (prompt, max, key, model) => ({ url: 'https://api.anthropic.com/v1/messages', headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' }, body: { model, max_tokens: max, messages: [{ role: 'user', content: prompt }] } }),
    text: (j) => (j.content || []).map((c) => c.text || '').join(''),
  },
};

const cooldown = new Map(); // provider -> time until which it is skipped (after 429 / 5xx / bad key)

export const activeProviders = () =>
  (process.env.AI_PROVIDERS || 'groq,gemini,anthropic').split(',').map((s) => s.trim()).filter((n) => defs[n] && process.env[defs[n].key]);
export const aiEnabled = () => activeProviders().length > 0;

export async function callAI(prompt, maxTokens = 4000) {
  const errors = [];
  for (const name of activeProviders()) {
    if ((cooldown.get(name) || 0) > Date.now()) { errors.push(`${name}: cooling down`); continue; }
    const d = defs[name], r = d.req(prompt, maxTokens, process.env[d.key], d.model());
    try {
      const res = await fetch(r.url, { method: 'POST', headers: { 'content-type': 'application/json', ...r.headers }, body: JSON.stringify(r.body), signal: AbortSignal.timeout(90000) });
      if (res.status === 429 || res.status >= 500) { cooldown.set(name, Date.now() + Math.min(Number(res.headers.get('retry-after')) || 60, 300) * 1000); errors.push(`${name}: HTTP ${res.status} (rate limit / busy)`); continue; }
      if (res.status === 401 || res.status === 403) { cooldown.set(name, Date.now() + 600000); errors.push(`${name}: HTTP ${res.status} (check the API key)`); continue; }
      if (!res.ok) { errors.push(`${name}: HTTP ${res.status} ${(await res.text()).slice(0, 150)}`); continue; }
      const text = d.text(await res.json());
      if (!text) { errors.push(`${name}: empty reply`); continue; }
      return text;
    } catch (e) { errors.push(`${name}: ${e.message}`); }
  }
  throw new Error(`All AI providers failed -> ${errors.join(' | ') || 'no provider configured'}`);
}