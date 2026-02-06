/* eslint-disable no-console */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const INCLUDE_OPTIONAL = process.env.SMOKE_SKIP_OPTIONAL !== '1';

const buildUrl = (path) => `${BASE_URL}${path}`;

const readResponse = async (res) => {
  if (res.status === 204) {
    return { text: '', json: null };
  }
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { text, json };
};

const snippet = (text) => (text ? text.slice(0, 200) : '');

const assertResponse = (step, url, res, json, text, allowedStatuses) => {
  if (!allowedStatuses.includes(res.status)) {
    throw new Error(
      `${step}: HTTP ${res.status} for ${url} - ${snippet(text) || 'no body'}`,
    );
  }
  if (json && json.success === false) {
    throw new Error(
      `${step}: API error for ${url} - ${json.error || json.message || 'unknown'}`,
    );
  }
  if (!json && res.status !== 204) {
    throw new Error(`${step}: invalid JSON for ${url} - ${snippet(text)}`);
  }
};

const request = async (method, path, body) => {
  const url = buildUrl(path);
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const { text, json } = await readResponse(res);
  return { url, res, text, json };
};

const runStep = async (name, fn) => {
  try {
    const result = await fn();
    console.log(`ok - ${name}`);
    return result;
  } catch (error) {
    console.error(`fail - ${name}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

const runOptional = async (name, fn) => {
  if (!INCLUDE_OPTIONAL) {
    console.log(`skip - ${name}`);
    return null;
  }
  return runStep(name, fn);
};

async function main() {
  const timestamp = new Date().toISOString();
  const seedText = `Smoke test ${timestamp}`;

  const created = await runStep('create session', async () => {
    const result = await request('POST', '/api/sessions', { text: seedText });
    assertResponse('create session', result.url, result.res, result.json, result.text, [201]);
    return result.json.data;
  });

  const sessionId = created.id;
  const editText = `Smoke edit ${timestamp}`;

  const edited = await runStep('create edit version', async () => {
    const result = await request('POST', `/api/sessions/${sessionId}/edits`, {
      text: editText,
    });
    assertResponse('create edit version', result.url, result.res, result.json, result.text, [201]);
    return result.json.data;
  });

  const activeSessionId = edited?.id ?? sessionId;
  const len = editText.length;

  await runStep('list notes', async () => {
    const result = await request(
      'GET',
      `/api/sessions/${activeSessionId}/notes?start=0&end=${len}`,
    );
    assertResponse('list notes', result.url, result.res, result.json, result.text, [200]);
  });

  const note = await runStep('create note', async () => {
    const result = await request('POST', `/api/sessions/${activeSessionId}/notes`, {
      start_offset: 0,
      end_offset: 1,
      note: 'n1',
    });
    assertResponse('create note', result.url, result.res, result.json, result.text, [201]);
    return result.json.data;
  });

  await runStep('update note', async () => {
    const result = await request('PATCH', `/api/notes/${note.id}`, {
      note: 'n1 updated',
    });
    assertResponse('update note', result.url, result.res, result.json, result.text, [200]);
  });

  await runStep('delete note', async () => {
    const result = await request('DELETE', `/api/notes/${note.id}`);
    assertResponse('delete note', result.url, result.res, result.json, result.text, [204]);
  });

  const run = await runStep('analysis run', async () => {
    const result = await request('POST', `/api/sessions/${activeSessionId}/analysis-runs`, {
      engine_version: 'deterministic-v1',
      config: {},
    });
    assertResponse('analysis run', result.url, result.res, result.json, result.text, [200, 201]);
    return result.json.data;
  });

  await runStep('analysis findings', async () => {
    const result = await request(
      'GET',
      `/api/analysis-runs/${run.id}/findings?start=0&end=${len}`,
    );
    assertResponse('analysis findings', result.url, result.res, result.json, result.text, [200]);
  });

  await runOptional('sessions last', async () => {
    const result = await request('GET', '/api/sessions/last');
    assertResponse('sessions last', result.url, result.res, result.json, result.text, [200]);
  });

  await runOptional('sessions search_page', async () => {
    const result = await request(
      'GET',
      `/api/sessions/search_page?q=Smoke&page=1&pageSize=5`,
    );
    assertResponse('sessions search_page', result.url, result.res, result.json, result.text, [200]);
  });

  console.log('Smoke API completed');
}

main().catch((error) => {
  console.error('Smoke API failed');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
