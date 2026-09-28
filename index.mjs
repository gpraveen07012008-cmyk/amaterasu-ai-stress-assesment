import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import { randomBytes, randomInt, randomUUID, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocket, WebSocketServer } from 'ws';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDirectory = path.resolve(projectRoot, process.env.DATA_DIR || '.data');
const accountsPath = path.join(dataDirectory, 'accounts.json');
const sessionCookie = 'amaterasu_session';
const isProduction = process.env.NODE_ENV === 'production';
const authSecret = process.env.AUTH_SECRET || (!isProduction ? randomBytes(48).toString('base64url') : '');

if (!authSecret) {
  throw new Error('AUTH_SECRET must be configured for production.');
}
if (!process.env.AUTH_SECRET) {
  console.warn('AUTH_SECRET is unset; sessions will be invalidated when this development server restarts.');
}

mkdirSync(dataDirectory, { recursive: true });

let accounts = new Map();
if (existsSync(accountsPath)) {
  try {
    const storedAccounts = JSON.parse(readFileSync(accountsPath, 'utf8'));
    accounts = new Map(storedAccounts.map((account) => [account.userId.toLowerCase(), account]));
  } catch (error) {
    console.error('Unable to read account database:', error);
    process.exit(1);
  }
}

const saveAccounts = () => {
  const serializedAccounts = JSON.stringify([...accounts.values()], null, 2);
  const temporaryPath = accountsPath + "." + process.pid + "." + randomUUID() + ".tmp";
  writeFileSync(temporaryPath, serializedAccounts, { mode: 0o600 });
  try {
    renameSync(temporaryPath, accountsPath);
  } catch (error) {
    if (!['EACCES', 'EEXIST', 'EPERM'].includes(error.code)) throw error;
    writeFileSync(accountsPath, serializedAccounts, { mode: 0o600 });
  } finally {
    if (existsSync(temporaryPath)) unlinkSync(temporaryPath);
  }
};
const makeCallId = () => {
  let callId;
  const existingIds = new Set([...accounts.values()].map((account) => account.anonymousId));
  do {
    callId = "User_" + randomInt(100000, 1000000);
  } while (existingIds.has(callId));
  return callId;
};

const hashPassword = (password, salt = randomBytes(16).toString('hex')) => ({
  salt,
  hash: scryptSync(password, salt, 64).toString('hex')
});

if (!isProduction && !accounts.has('alex.rivera')) {
  const demoPassword = hashPassword('Password123!');
  accounts.set('alex.rivera', {
    id: 'usr_789123',
    userId: 'alex.rivera',
    name: 'Alex Rivera',
    email: 'alex@example.test',
    phoneNumber: '+10000000000',
    passwordSalt: demoPassword.salt,
    passwordHash: demoPassword.hash,
    maritalStatus: 'Single',
    sex: 'Prefer not to say',
    dob: '2001-05-14',
    credits: 70,
    anonymousId: 'User_4821',
    favouriteCallers: ['User_7392'],
    createdAt: '2026-09-01T08:00:00.000Z',
    lastSvi: 56,
    lastRegion: 'ORANGE',
    lastConcern: 'Academic pressure',
    lastAssessmentDate: '2026-09-24T14:30:00.000Z'
  });
  saveAccounts();
}

const passwordMatches = (password, account) => {
  const expected = Buffer.from(account.passwordHash, 'hex');
  const actual = scryptSync(password, account.passwordSalt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

const publicProfile = (account) => ({
  id: account.id,
  name: account.name,
  userId: account.userId,
  email: account.email,
  phoneNumber: account.phoneNumber,
  maritalStatus: account.maritalStatus,
  sex: account.sex,
  dob: account.dob,
  credits: account.credits,
  anonymousId: account.anonymousId,
  favouriteCallers: account.favouriteCallers,
  createdAt: account.createdAt,
  lastSvi: account.lastSvi,
  lastRegion: account.lastRegion,
  lastConcern: account.lastConcern,
  lastAssessmentDate: account.lastAssessmentDate
});

const signSession = (account) => {
  const payload = Buffer.from(JSON.stringify({
    sub: account.id,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7
  })).toString('base64url');
  const signature = createHmac('sha256', authSecret).update(payload).digest('base64url');
  return payload + "." + signature;
};

const verifySession = (token) => {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', authSecret).update(payload).digest();
  let supplied;
  try {
    supplied = Buffer.from(signature, 'base64url');
  } catch {
    return null;
  }
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (session.expiresAt < Date.now()) return null;
    return [...accounts.values()].find((account) => account.id === session.sub) || null;
  } catch {
    return null;
  }
};

const readCookies = (header = '') => Object.fromEntries(header.split(';').map((part) => {
  const separator = part.indexOf('=');
  return separator < 0 ? ['', ''] : [part.slice(0, separator).trim(), decodeURIComponent(part.slice(separator + 1).trim())];
}));

const accountFromRequest = (request) => verifySession(readCookies(request.headers.cookie)[sessionCookie]);
const cookieOptions = 'Path=/; HttpOnly; SameSite=Strict; Max-Age=604800' + (isProduction ? '; Secure' : '');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '24kb' }));

const requireAccount = (request, response, next) => {
  const account = accountFromRequest(request);
  if (!account) return response.status(401).json({ error: 'Please sign in to continue.' });
  request.account = account;
  next();
};

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

app.post('/api/auth/register', (request, response) => {
  const data = request.body || {};
  const userId = typeof data.userId === 'string' ? data.userId.trim().toLowerCase() : '';
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const phoneNumber = typeof data.phoneNumber === 'string' ? data.phoneNumber.trim() : '';
  const password = typeof data.password === 'string' ? data.password : '';
  const phoneDigits = phoneNumber.replace(/\D/g, '');

  if (!data.name?.trim() || !/^[a-z0-9._-]{3,32}$/.test(userId) || password.length < 6) {
    return response.status(400).json({ error: 'Please check your name, user ID, and password.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!/^\+?[0-9\s().-]+$/.test(phoneNumber) || phoneDigits.length < 7 || phoneDigits.length > 15) {
    return response.status(400).json({ error: 'Please enter a valid phone number.' });
  }
  if (!data.dob || !['Male', 'Female', 'Other', 'Prefer not to say'].includes(data.sex)) {
    return response.status(400).json({ error: 'Please complete the required profile fields.' });
  }
  if (accounts.has(userId) || [...accounts.values()].some((account) => account.email === email)) {
    return response.status(409).json({ error: 'User ID or email is already registered.' });
  }

  const passwordRecord = hashPassword(password);
  const account = {
    id: randomUUID(),
    userId,
    name: data.name.trim(),
    email,
    phoneNumber,
    passwordSalt: passwordRecord.salt,
    passwordHash: passwordRecord.hash,
    maritalStatus: data.maritalStatus,
    sex: data.sex,
    dob: data.dob,
    credits: 70,
    anonymousId: makeCallId(),
    favouriteCallers: [],
    createdAt: new Date().toISOString(),
    lastSvi: 0
  };
  accounts.set(account.userId, account);
  saveAccounts();
  response.setHeader('Set-Cookie', sessionCookie + '=' + signSession(account) + '; ' + cookieOptions);
  return response.status(201).json({ user: publicProfile(account) });
});

app.post('/api/auth/migrate', (request, response) => {
  const profile = request.body?.profile || {};
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  const userId = typeof profile.userId === 'string' ? profile.userId.trim().toLowerCase() : '';
  const email = typeof profile.email === 'string' ? profile.email.trim().toLowerCase() : '';
  const phoneNumber = typeof profile.phoneNumber === 'string' ? profile.phoneNumber.trim() : '';
  const phoneDigits = phoneNumber.replace(/\D/g, '');
  if (!profile.name?.trim() || !/^[a-z0-9._-]{3,32}$/.test(userId) || password.length < 6) {
    return response.status(400).json({ error: 'The existing account profile is incomplete.' });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(400).json({ error: 'The existing account email is invalid.' });
  }
  if (phoneNumber && (!/^\+?[0-9\s().-]+$/.test(phoneNumber) || phoneDigits.length < 7 || phoneDigits.length > 15)) {
    return response.status(400).json({ error: 'The existing account phone number is invalid.' });
  }
  if (accounts.has(userId) || (email && [...accounts.values()].some((account) => account.email === email))) {
    return response.status(409).json({ error: 'This account has already been registered on the server.' });
  }

  const passwordRecord = hashPassword(password);
  const validCallers = Array.isArray(profile.favouriteCallers)
    ? profile.favouriteCallers.filter((id) => typeof id === 'string' && /^User_\d{4,6}$/.test(id)).slice(0, 500)
    : [];
  const account = {
    id: randomUUID(),
    userId,
    name: profile.name.trim(),
    ...(email ? { email } : {}),
    ...(phoneNumber ? { phoneNumber } : {}),
    passwordSalt: passwordRecord.salt,
    passwordHash: passwordRecord.hash,
    maritalStatus: profile.maritalStatus,
    sex: profile.sex,
    dob: profile.dob,
    credits: Number.isInteger(profile.credits) ? Math.max(0, Math.min(profile.credits, 100000)) : 70,
    anonymousId: makeCallId(),
    favouriteCallers: [...new Set(validCallers)],
    createdAt: typeof profile.createdAt === 'string' ? profile.createdAt : new Date().toISOString(),
    lastSvi: Number.isInteger(profile.lastSvi) ? Math.max(0, Math.min(profile.lastSvi, 100)) : 0,
    ...( ['GREEN', 'ORANGE', 'RED'].includes(profile.lastRegion) ? { lastRegion: profile.lastRegion } : {}),
    ...(typeof profile.lastConcern === 'string' ? { lastConcern: profile.lastConcern.slice(0, 80) } : {}),
    ...(typeof profile.lastAssessmentDate === 'string' ? { lastAssessmentDate: profile.lastAssessmentDate } : {})
  };
  accounts.set(userId, account);
  saveAccounts();
  response.setHeader('Set-Cookie', sessionCookie + '=' + signSession(account) + '; ' + cookieOptions);
  return response.status(201).json({ user: publicProfile(account) });
});

app.post('/api/auth/login', (request, response) => {
  const userId = typeof request.body?.userId === 'string' ? request.body.userId.trim().toLowerCase() : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  const account = accounts.get(userId);
  if (!account || !passwordMatches(password, account)) {
    return response.status(401).json({ error: 'Invalid user ID or password.' });
  }
  response.setHeader('Set-Cookie', sessionCookie + '=' + signSession(account) + '; ' + cookieOptions);
  return response.json({ user: publicProfile(account) });
});

app.get('/api/auth/session', requireAccount, (request, response) => {
  response.json({ user: publicProfile(request.account) });
});

app.patch('/api/auth/profile', requireAccount, (request, response) => {
  const account = request.account;
  const changes = request.body || {};
  if (Number.isInteger(changes.credits) && changes.credits >= 0 && changes.credits <= 100000) {
    account.credits = changes.credits;
  }
  if (Array.isArray(changes.favouriteCallers) && changes.favouriteCallers.length <= 500 && changes.favouriteCallers.every((id) => typeof id === 'string' && /^User_\d{4,6}$/.test(id))) {
    account.favouriteCallers = [...new Set(changes.favouriteCallers)];
  }
  if (Number.isInteger(changes.lastSvi) && changes.lastSvi >= 0 && changes.lastSvi <= 100) {
    account.lastSvi = changes.lastSvi;
  }
  if (['GREEN', 'ORANGE', 'RED'].includes(changes.lastRegion)) account.lastRegion = changes.lastRegion;
  if (typeof changes.lastConcern === 'string' && changes.lastConcern.length <= 80) account.lastConcern = changes.lastConcern;
  if (typeof changes.lastAssessmentDate === 'string' && !Number.isNaN(Date.parse(changes.lastAssessmentDate))) {
    account.lastAssessmentDate = changes.lastAssessmentDate;
  }
  saveAccounts();
  response.json({ user: publicProfile(account) });
});

app.post('/api/auth/logout', (_request, response) => {
  response.setHeader('Set-Cookie', sessionCookie + '=; ' + cookieOptions + '; Max-Age=0');
  response.status(204).end();
});

const parseTurnUrls = () => (process.env.TURN_URLS || '').split(',').map((url) => url.trim()).filter(Boolean);

app.get('/api/calls/ice', requireAccount, (request, response) => {
  const iceServers = [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }
  ];
  const turnUrls = parseTurnUrls();
  const turnSecret = process.env.TURN_SHARED_SECRET;
  if (turnUrls.length && turnSecret) {
    const expires = Math.floor(Date.now() / 1000) + 10 * 60;
    const username = expires + ':' + request.account.id;
    const credential = createHmac('sha1', turnSecret).update(username).digest('base64');
    iceServers.push({ urls: turnUrls, username, credential });
  }
  response.setHeader('Cache-Control', 'no-store');
  response.json({ iceServers });
});

const httpServer = createServer(app);
const webSocketServer = new WebSocketServer({ noServer: true, maxPayload: 32 * 1024 });
const onlineAccounts = new Map();
const calls = new Map();
const accountCalls = new Map();

const send = (socket, event, data = {}) => {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ event, ...data }));
};

const accountByCallId = (callId) => {
  if (typeof callId !== 'string' || !/^user_\d{4,6}$/i.test(callId.trim())) return null;
  const normalizedCallId = callId.trim().toLowerCase();
  return [...accounts.values()].find((account) => account.anonymousId.toLowerCase() === normalizedCallId) || null;
};
const callForAccount = (callId, accountId) => {
  const call = calls.get(callId);
  return call && (call.callerId === accountId || call.calleeId === accountId) ? call : null;
};

const finishCall = (call, reason, sourceSocket = null) => {
  if (!call || !calls.has(call.id)) return;
  clearTimeout(call.timeout);
  const peerSocket = sourceSocket === call.callerSocket ? call.calleeSocket : call.callerSocket;
  send(peerSocket, 'call:ended', { callId: call.id, reason });
  accountCalls.delete(call.callerId);
  accountCalls.delete(call.calleeId);
  calls.delete(call.id);
};

const validOrigin = (origin, host) => {
  if (!origin) return false;
  if (process.env.PUBLIC_APP_ORIGIN) return origin === process.env.PUBLIC_APP_ORIGIN;
  if (isProduction) return origin === 'https://' + host;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
};

httpServer.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '/', 'http://localhost').pathname;
  if (pathname !== '/ws' || !validOrigin(request.headers.origin, request.headers.host)) {
    socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
    socket.destroy();
    return;
  }
  const account = accountFromRequest(request);
  if (!account) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }
  webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
    webSocket.account = account;
    webSocketServer.emit('connection', webSocket, request);
  });
});

webSocketServer.on('connection', (socket) => {
  const account = socket.account;
  const currentSocket = onlineAccounts.get(account.id);
  if (currentSocket && currentSocket !== socket) currentSocket.close(4001, 'Another session connected');
  onlineAccounts.set(account.id, socket);
  send(socket, 'ready', { callId: account.anonymousId });
  for (const call of calls.values()) {
    if (call.calleeId === account.id && call.status === 'ringing' && !call.calleeSocket) {
      call.calleeSocket = socket;
      send(socket, 'call:incoming', { callId: call.id, peerCallId: call.callerCallId });
    }
  }

  socket.on('message', (rawMessage) => {
    let message;
    try {
      message = JSON.parse(rawMessage.toString());
    } catch {
      send(socket, 'call:error', { error: 'Invalid signaling message.' });
      return;
    }

    if (message.event === 'call:start') {
      const targetCallId = typeof message.targetCallId === 'string' ? message.targetCallId.trim() : '';
      const recipient = accountByCallId(targetCallId);
      const recipientSocket = recipient && onlineAccounts.get(recipient.id);
      if (!recipient) return send(socket, 'call:error', { error: 'Invalid Dummy Call ID. No registered user has that ID.' });
      if (recipient.id === account.id) return send(socket, 'call:error', { error: 'You cannot call your own Call ID.' });
      if (accountCalls.has(account.id) || accountCalls.has(recipient.id)) {
        return send(socket, 'call:error', { error: 'One of the users is already in a call.' });
      }

      const call = {
        id: randomUUID(),
        callerId: account.id,
        calleeId: recipient.id,
        callerCallId: account.anonymousId,
        calleeCallId: recipient.anonymousId,
        callerSocket: socket,
        calleeSocket: recipientSocket?.readyState === WebSocket.OPEN ? recipientSocket : null,
        status: 'ringing'
      };
      accountCalls.set(account.id, call.id);
      accountCalls.set(recipient.id, call.id);
      calls.set(call.id, call);
      call.timeout = setTimeout(() => finishCall(call, 'no-answer'), 45000);
      send(socket, 'call:ringing', { callId: call.id, peerCallId: recipient.anonymousId });
      if (call.calleeSocket) {
        send(call.calleeSocket, 'call:incoming', { callId: call.id, peerCallId: account.anonymousId });
      }
      return;
    }

    const call = typeof message.callId === 'string' ? callForAccount(message.callId, account.id) : null;
    if (!call) return send(socket, 'call:error', { error: 'Call session is no longer available.' });

    if (message.event === 'call:accept' && call.calleeId === account.id && call.status === 'ringing') {
      clearTimeout(call.timeout);
      call.status = 'accepted';
      send(call.callerSocket, 'call:accepted', { callId: call.id, peerCallId: call.calleeCallId, role: 'caller' });
      send(call.calleeSocket, 'call:accepted', { callId: call.id, peerCallId: call.callerCallId, role: 'callee' });
      return;
    }

    if (message.event === 'call:reject' && call.calleeId === account.id && call.status === 'ringing') {
      send(call.callerSocket, 'call:rejected', { callId: call.id, reason: 'declined' });
      accountCalls.delete(call.callerId);
      accountCalls.delete(call.calleeId);
      calls.delete(call.id);
      return;
    }

    if (message.event === 'call:end') {
      finishCall(call, 'ended', socket);
      return;
    }

    if (message.event === 'call:signal' && call.status === 'accepted') {
      const signal = message.signal;
      if (!signal || !['offer', 'answer', 'ice'].includes(signal.type)) return;
      const recipientSocket = account.id === call.callerId ? call.calleeSocket : call.callerSocket;
      send(recipientSocket, 'call:signal', { callId: call.id, signal });
      return;
    }

    send(socket, 'call:error', { error: 'Unsupported call action.' });
  });

  socket.on('close', () => {
    if (onlineAccounts.get(account.id) === socket) onlineAccounts.delete(account.id);
    const activeCallId = accountCalls.get(account.id);
    const activeCall = activeCallId && calls.get(activeCallId);
    if (activeCall) finishCall(activeCall, 'peer-disconnected', socket);
  });
});

if (isProduction) {
  const distributionDirectory = path.join(projectRoot, 'dist');
  app.use(express.static(distributionDirectory, { index: false }));
  app.get('*', (_request, response) => response.sendFile(path.join(distributionDirectory, 'index.html')));
}

const startServer = (port) => {
  const onError = (error) => {
    if (error.code === 'EADDRINUSE' && !process.env.PORT && port < 3100) {
      startServer(port + 1);
      return;
    }
    console.error('Unable to start the Amaterasu server on port ' + port + ':', error.message);
    process.exit(1);
  };
  httpServer.once('error', onError);
  httpServer.listen(port, '0.0.0.0', () => {
    httpServer.off('error', onError);
    console.log('Amaterasu signaling server listening on port ' + port);
  });
};

startServer(Number(process.env.PORT || 3001));
process.on('SIGINT', () => {
  webSocketServer.close();
  httpServer.close(() => process.exit(0));
});