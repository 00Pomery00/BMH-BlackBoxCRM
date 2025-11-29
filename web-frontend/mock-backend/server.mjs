import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mock telemetry heartbeat endpoint
app.post('/telemetry/heartbeat', (req, res) => {
  res.status(204).end();
});

let leads = [];
let users = [
  { id: 'u-1', email: 'admin', password: 'admin' },
];
const tokens = new Map();

function makeId(prefix) {
  return `${prefix || 'id'}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
}

app.post('/mobile/leads', (req, res) => {
  const { name, email, lead_score } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'missing name/email' });
  const lead = { id: makeId('lead'), name, email, lead_score: lead_score || 0 };
  leads.push(lead);
  res.status(201).json(lead);
});

app.get('/companies', (req, res) => {
  const companies = leads.map((l, i) => ({
    id: `c-${i}`,
    name: l.name,
    lead_score: l.lead_score || 0,
    leads: [l],
  }));
  res.json(companies);
});

app.post('/fu_auth/register', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing' });
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'exists' });
  const user = { id: makeId('u'), email, password };
  users.push(user);
  res.status(201).json({ id: user.id, email: user.email });
});

app.post('/fu_auth/jwt/login', (req, res) => {
  const data = req.body;
  const username = data && (data.username || data.email);
  const password = data && (data.password || data.password);
  const user = users.find(u => u.email === username);
  if (!user || user.password !== password) return res.status(401).json({ error: 'invalid' });
  const token = 'mocktoken-' + Math.random().toString(36).slice(2);
  tokens.set(token, user);
  res.json({ access_token: token, token_type: 'bearer' });
});

app.get('/auth/me', (req, res) => {
  const h = req.headers['authorization'] || '';
  const m = h.match(/Bearer (.+)$/i);
  if (!m) return res.status(401).json({ error: 'missing token' });
  const token = m[1];
  const user = tokens.get(token);
  if (!user) return res.status(401).json({ error: 'invalid token' });
  res.json({ id: user.id, email: user.email });
});


// Globální zachycení chyb
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

const port = process.env.PORT || 8002;
app.listen(port, () => console.log(`Mock backend listening on http://127.0.0.1:${port}`));
