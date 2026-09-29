<<<<<<< HEAD
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const children = [];
let stopping = false;

const isPortAvailable = (port) => new Promise((resolve) => {
  const probe = createServer();
  probe.once('error', () => resolve(false));
  probe.listen(port, '0.0.0.0', () => probe.close(() => resolve(true)));
});

const findAvailablePort = async (startPort, excludedPorts = new Set()) => {
  for (let port = startPort; port < startPort + 1000; port += 1) {
    if (excludedPorts.has(port)) continue;
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`Could not find an available port starting at ${startPort}.`);
};

const hasHealthyServer = async (port) => {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(1200) });
    if (!response.ok) return false;
    const health = await response.json();
    return health.status === 'ok';
  } catch {
    return false;
  }
};

const findHealthyServer = async (startPort, endPort) => {
  for (let port = startPort; port <= endPort; port += 1) {
    if (!(await isPortAvailable(port)) && await hasHealthyServer(port)) return port;
  }
  return null;
};

const launch = (script, args, env) => {
  const child = spawn(process.execPath, [script, ...args], {
    cwd: projectRoot,
    env: { ...process.env, ...env },
    stdio: 'inherit'
  });
  children.push(child);
  child.once('exit', (code) => {
    if (stopping) return;
    stopAll();
    process.exitCode = code || 0;
  });
  return child;
};

const stopAll = () => {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => {
    if (child.exitCode === null) child.kill('SIGTERM');
  });
};

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);

try {
  let apiPort;
  const configuredApiPort = Number(process.env.API_SERVER_PORT || 0);
  if (configuredApiPort && await hasHealthyServer(configuredApiPort)) {
    apiPort = configuredApiPort;
    console.log(`Using existing Amaterasu server on port ${apiPort}.`);
  } else {
    if (configuredApiPort && !(await isPortAvailable(configuredApiPort))) {
      throw new Error(`Port ${configuredApiPort} is occupied by a service that is not the Amaterasu API. Choose another API_SERVER_PORT.`);
    }
    const existingApiPort = configuredApiPort ? null : await findHealthyServer(3001, 3100);
    if (existingApiPort) {
      apiPort = existingApiPort;
      console.log(`Using existing Amaterasu server on port ${apiPort}.`);
    } else {
      apiPort = configuredApiPort || await findAvailablePort(3001);
      launch(path.join(projectRoot, 'server', 'index.mjs'), [], { PORT: String(apiPort) });

      let ready = false;
      for (let attempt = 0; attempt < 50; attempt += 1) {
        if (await hasHealthyServer(apiPort)) {
          ready = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (!ready) throw new Error(`Amaterasu server did not become healthy on port ${apiPort}.`);
    }
  }

  const configuredVitePort = Number(process.env.VITE_PORT || 0);
  const vitePort = configuredVitePort
    ? (await isPortAvailable(configuredVitePort)
      ? configuredVitePort
      : await findAvailablePort(configuredVitePort + 1, new Set([apiPort])))
    : await findAvailablePort(3000, new Set([apiPort]));

  console.log(`Amaterasu frontend: http://localhost:${vitePort}/`);
  console.log(`Amaterasu account/signaling API: http://localhost:${apiPort}/`);
  launch(path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js'), ['--host', '0.0.0.0', '--port', String(vitePort), '--strictPort'], {
    API_SERVER_PORT: String(apiPort)
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  stopAll();
  process.exitCode = 1;
=======
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const children = [];
let stopping = false;

const isPortAvailable = (port) => new Promise((resolve) => {
  const probe = createServer();
  probe.once('error', () => resolve(false));
  probe.listen(port, '0.0.0.0', () => probe.close(() => resolve(true)));
});

const findAvailablePort = async (startPort, excludedPorts = new Set()) => {
  for (let port = startPort; port < startPort + 1000; port += 1) {
    if (excludedPorts.has(port)) continue;
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`Could not find an available port starting at ${startPort}.`);
};

const hasHealthyServer = async (port) => {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(1200) });
    if (!response.ok) return false;
    const health = await response.json();
    return health.status === 'ok';
  } catch {
    return false;
  }
};

const findHealthyServer = async (startPort, endPort) => {
  for (let port = startPort; port <= endPort; port += 1) {
    if (!(await isPortAvailable(port)) && await hasHealthyServer(port)) return port;
  }
  return null;
};

const launch = (script, args, env) => {
  const child = spawn(process.execPath, [script, ...args], {
    cwd: projectRoot,
    env: { ...process.env, ...env },
    stdio: 'inherit'
  });
  children.push(child);
  child.once('exit', (code) => {
    if (stopping) return;
    stopAll();
    process.exitCode = code || 0;
  });
  return child;
};

const stopAll = () => {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => {
    if (child.exitCode === null) child.kill('SIGTERM');
  });
};

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);

try {
  let apiPort;
  const configuredApiPort = Number(process.env.API_SERVER_PORT || 0);
  if (configuredApiPort && await hasHealthyServer(configuredApiPort)) {
    apiPort = configuredApiPort;
    console.log(`Using existing Amaterasu server on port ${apiPort}.`);
  } else {
    if (configuredApiPort && !(await isPortAvailable(configuredApiPort))) {
      throw new Error(`Port ${configuredApiPort} is occupied by a service that is not the Amaterasu API. Choose another API_SERVER_PORT.`);
    }
    const existingApiPort = configuredApiPort ? null : await findHealthyServer(3001, 3100);
    if (existingApiPort) {
      apiPort = existingApiPort;
      console.log(`Using existing Amaterasu server on port ${apiPort}.`);
    } else {
      apiPort = configuredApiPort || await findAvailablePort(3001);
      launch(path.join(projectRoot, 'server', 'index.mjs'), [], { PORT: String(apiPort) });

      let ready = false;
      for (let attempt = 0; attempt < 50; attempt += 1) {
        if (await hasHealthyServer(apiPort)) {
          ready = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (!ready) throw new Error(`Amaterasu server did not become healthy on port ${apiPort}.`);
    }
  }

  const configuredVitePort = Number(process.env.VITE_PORT || 0);
  const vitePort = configuredVitePort
    ? (await isPortAvailable(configuredVitePort)
      ? configuredVitePort
      : await findAvailablePort(configuredVitePort + 1, new Set([apiPort])))
    : await findAvailablePort(3000, new Set([apiPort]));

  console.log(`Amaterasu frontend: http://localhost:${vitePort}/`);
  console.log(`Amaterasu account/signaling API: http://localhost:${apiPort}/`);
  launch(path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js'), ['--host', '0.0.0.0', '--port', String(vitePort), '--strictPort'], {
    API_SERVER_PORT: String(apiPort)
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  stopAll();
  process.exitCode = 1;
>>>>>>> 187d472 (Add original Amaterasu app)
}