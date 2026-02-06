/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const repoRoot = path.resolve(__dirname, '..');
const requiredPath = path.join(repoRoot, 'config', 'api-proxy-required.json');
const appApiRoot = path.join(repoRoot, 'app', 'api');

const requiredConfig = JSON.parse(fs.readFileSync(requiredPath, 'utf-8'));
const openApiPath = path.join(
  repoRoot,
  requiredConfig.source || 'docs/openapi.yaml',
);
const spec = yaml.parse(fs.readFileSync(openApiPath, 'utf-8'));

const specPaths = spec?.paths ?? {};

const normalizeRequiredSegments = (apiPath) => {
  const stripped = apiPath.replace(/^\/api\/v1/, '/api').replace(/^\/api/, '');
  return stripped
    .split('/')
    .filter(Boolean)
    .map((segment) => (segment.startsWith('{') && segment.endsWith('}') ? '*' : segment));
};

const normalizeRouteSegments = (routeFile) => {
  const rel = path.relative(appApiRoot, routeFile);
  const segments = rel.split(path.sep).slice(0, -1);
  return segments.map((segment) =>
    segment.startsWith('[') && segment.endsWith(']') ? '*' : segment,
  );
};

const matchSegments = (required, actual) => {
  if (required.length !== actual.length) return false;
  return required.every((segment, index) => {
    if (segment === '*') return actual[index] === '*';
    return segment === actual[index];
  });
};

const getRouteMethods = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const methods = new Set();
  const functionRegex =
    /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b/g;
  const constRegex =
    /export\s+const\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s*=/g;
  let match = functionRegex.exec(content);
  while (match) {
    methods.add(match[1].toUpperCase());
    match = functionRegex.exec(content);
  }
  match = constRegex.exec(content);
  while (match) {
    methods.add(match[1].toUpperCase());
    match = constRegex.exec(content);
  }
  return methods;
};

const routeFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && entry.name === 'route.ts') {
      routeFiles.push(fullPath);
    }
  }
};

walk(appApiRoot);

const routeIndex = routeFiles.map((file) => ({
  file,
  segments: normalizeRouteSegments(file),
  methods: getRouteMethods(file),
}));

const missingInSpec = [];
const missingRoutes = [];
const missingMethods = [];

for (const entry of requiredConfig.required) {
  const method = entry.method.toUpperCase();
  const apiPath = entry.path;
  const specPath = specPaths[apiPath];
  const specMethod = specPath?.[method.toLowerCase()];

  if (!specPath || !specMethod) {
    missingInSpec.push({ method, path: apiPath });
  }

  const requiredSegments = normalizeRequiredSegments(apiPath);
  const route = routeIndex.find((candidate) =>
    matchSegments(requiredSegments, candidate.segments),
  );

  if (!route) {
    missingRoutes.push({ method, path: apiPath });
    continue;
  }

  if (!route.methods.has(method)) {
    missingMethods.push({ method, path: apiPath, file: route.file });
  }
}

if (missingInSpec.length || missingRoutes.length || missingMethods.length) {
  console.error('API Proxy Coverage Check Failed');
  if (missingInSpec.length) {
    console.error('\nMissing in docs/openapi.yaml:');
    for (const item of missingInSpec) {
      console.error(`  - ${item.method} ${item.path}`);
    }
  }
  if (missingRoutes.length) {
    console.error('\nMissing Next.js proxy route:');
    for (const item of missingRoutes) {
      console.error(`  - ${item.method} ${item.path}`);
    }
  }
  if (missingMethods.length) {
    console.error('\nMissing HTTP method handler:');
    for (const item of missingMethods) {
      console.error(`  - ${item.method} ${item.path} (in ${item.file})`);
    }
  }
  process.exit(1);
}

console.log('API Proxy Coverage OK');
