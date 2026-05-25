const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000/api/v1';
const EMAIL = process.env.SMOKE_EMAIL ?? 'admin@biomed.local';
const PASSWORD = process.env.SMOKE_PASSWORD ?? 'Admin12345!';

const results = [];

function ok(name, extra = '') {
  results.push({ name, status: 'OK', extra });
  console.log(`OK: ${name}${extra ? ` — ${extra}` : ''}`);
}

function fail(name, message) {
  throw new Error(`FAIL: ${name} — ${message}`);
}

async function request(name, path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options).catch((error) => {
    fail(name, `request failed: ${error.message}`);
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    fail(name, `HTTP ${response.status} ${response.statusText}: ${body.slice(0, 300)}`);
  }

  return response;
}

async function jsonRequest(name, path, options = {}) {
  const response = await request(name, path, options);
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    fail(name, `invalid JSON: ${text.slice(0, 300)}`);
  }
}

async function binaryRequest(name, path, token) {
  const response = await request(name, path, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length === 0) {
    fail(name, 'empty response body');
  }

  return {
    contentType: response.headers.get('content-type') ?? '',
    size: buffer.length,
    buffer,
  };
}

function requireArray(name, value) {
  if (!Array.isArray(value)) {
    fail(name, 'expected array response');
  }
}

function requireObject(name, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(name, 'expected object response');
  }
}

console.log(`Running API smoke tests against ${BASE_URL}`);

const health = await jsonRequest('health', '/health');
requireObject('health', health);
if (health.status !== 'ok') {
  fail('health', `expected status ok, received ${health.status}`);
}
ok('health', health.service ?? '');

const databaseHealth = await jsonRequest('database health', '/health/database');
requireObject('database health', databaseHealth);
if (databaseHealth.status !== 'ok') {
  fail('database health', `expected status ok, received ${databaseHealth.status}`);
}
ok('database health', databaseHealth.database ?? '');

const login = await jsonRequest('auth login', '/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: EMAIL,
    password: PASSWORD,
  }),
});

requireObject('auth login', login);

if (!login.accessToken) {
  fail('auth login', 'missing accessToken');
}

const token = login.accessToken;
ok('auth login', `token length ${token.length}`);

const authHeaders = {
  Authorization: `Bearer ${token}`,
};

const me = await jsonRequest('auth me', '/auth/me', {
  headers: authHeaders,
});
requireObject('auth me', me);
if (!me.email) {
  fail('auth me', 'missing email');
}
ok('auth me', me.email);

const equipment = await jsonRequest('equipment list', '/equipment', {
  headers: authHeaders,
});
requireArray('equipment list', equipment);
ok('equipment list', `${equipment.length} rows`);

const orders = await jsonRequest('maintenance orders list', '/maintenance-orders', {
  headers: authHeaders,
});
requireArray('maintenance orders list', orders);
ok('maintenance orders list', `${orders.length} rows`);

const reportsSummary = await jsonRequest('reports summary', '/reports/summary', {
  headers: authHeaders,
});
requireObject('reports summary', reportsSummary);
if (!reportsSummary.equipment || !reportsSummary.maintenanceOrders) {
  fail('reports summary', 'missing equipment or maintenanceOrders summary');
}
ok('reports summary');

const alertsSummary = await jsonRequest('alerts summary', '/alerts/summary?days=30', {
  headers: authHeaders,
});
requireObject('alerts summary', alertsSummary);
if (!alertsSummary.counts) {
  fail('alerts summary', 'missing counts');
}
ok('alerts summary', `total alerts ${alertsSummary.counts.total}`);

const auditLogs = await jsonRequest('audit logs', '/audit-logs', {
  headers: authHeaders,
});
requireArray('audit logs', auditLogs);
ok('audit logs', `${auditLogs.length} rows`);

const equipmentCsv = await binaryRequest('equipment CSV download', '/reports/equipment.csv', token);
if (!equipmentCsv.contentType.includes('text/csv') && !equipmentCsv.contentType.includes('application/octet-stream')) {
  console.warn(`WARN: equipment CSV content-type was ${equipmentCsv.contentType}`);
}
ok('equipment CSV download', `${equipmentCsv.size} bytes`);

const equipmentXlsx = await binaryRequest('equipment XLSX download', '/reports/equipment.xlsx', token);
if (equipmentXlsx.size < 1000) {
  fail('equipment XLSX download', `file too small: ${equipmentXlsx.size} bytes`);
}
ok('equipment XLSX download', `${equipmentXlsx.size} bytes`);

if (orders.length > 0) {
  const orderId = orders[0].id;
  const pdf = await binaryRequest(
    'maintenance order PDF download',
    `/reports/maintenance-orders/${orderId}.pdf`,
    token,
  );

  const isPdf = pdf.buffer.subarray(0, 4).toString() === '%PDF';

  if (!isPdf) {
    fail('maintenance order PDF download', 'response does not start with %PDF');
  }

  ok('maintenance order PDF download', `${pdf.size} bytes`);
} else {
  console.log('SKIP: maintenance order PDF download — no orders available');
}

console.log('');
console.log(`API smoke tests completed successfully: ${results.length} checks passed`);
