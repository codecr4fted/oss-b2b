/**
 * Suite de Tests Automatisés - API OSS B2B
 * Utilise le test runner natif de Node.js (node:test & node:assert)
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

// Configuration pour l'environnement de test
process.env.NODE_ENV = 'test';
process.env.PORT = '5099';

const app = require('../server/app');
let server;
const BASE_URL = 'http://127.0.0.1:5099';

// Fonction utilitaire pour exécuter des requêtes HTTP natives dans les tests
function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

describe('OSS B2B - Tests API & Backend', () => {
  before((done) => {
    server = app.listen(5099, done);
  });

  after((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  test('GET /api/v1/health - La sonde de monitoring répond 200 OK', async () => {
    const res = await request('/api/v1/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'OK');
    assert.equal(res.body.service, 'OSS B2B API');
  });

  test('POST /api/v1/leads - Enregistrement d\'une inscription avec succès', async () => {
    const leadData = {
      full_name: 'Arthur Moundele',
      company: 'Logistique & Transit Pro',
      phone_prefix: '+242',
      phone_number: '06 500 12 34',
      plan: 'Currently',
      needs: 'Coordination de 20 agents de terrain'
    };

    const res = await request('/api/v1/leads', { method: 'POST' }, leadData);
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.leadId > 0);
  });

  test('POST /api/v1/leads - Rejet d\'une inscription incomplète (erreur 400)', async () => {
    const invalidData = { full_name: 'Arthur' };
    const res = await request('/api/v1/leads', { method: 'POST' }, invalidData);
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('GET /api/v1/activities - Récupération de la liste des activités en base', async () => {
    const res = await request('/api/v1/activities');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length > 0);
  });

  test('GET /api/v1/partners - Récupération des partenaires en base', async () => {
    const res = await request('/api/v1/partners');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  test('GET /api/v1/stats - Récupération des statistiques agrégées', async () => {
    const res = await request('/api/v1/stats');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.clients.total >= 0);
    assert.ok(res.body.data.partners.total >= 0);
  });

  test('POST /api/v1/auth/register & login - Cycle complet utilisateur', async () => {
    const testEmail = `dev_${Date.now()}@ossb2b.com`;
    const regRes = await request('/api/v1/auth/register', { method: 'POST' }, {
      email: testEmail,
      password: 'SecurePassword2026!',
      full_name: 'Test Administrator',
      company: 'OSS B2B Test Labs',
      plan: 'Currently'
    });

    assert.equal(regRes.status, 201);
    assert.equal(regRes.body.success, true);
    assert.ok(regRes.body.token);

    // Connexion
    const loginRes = await request('/api/v1/auth/login', { method: 'POST' }, {
      email: testEmail,
      password: 'SecurePassword2026!'
    });

    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.body.success, true);
    assert.ok(loginRes.body.token);

    // Accès protégé
    const meRes = await request('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${loginRes.body.token}` }
    });
    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.user.email, testEmail);
  });
});
