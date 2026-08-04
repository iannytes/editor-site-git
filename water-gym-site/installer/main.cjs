const { app, BrowserWindow, dialog, ipcMain, safeStorage, shell } = require('electron');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { createCommsStore } = require('./comms-store.cjs');
const { isPathAllowed, scanFolderInventory } = require('./allowed-folders.cjs');

const isPackaged = app.isPackaged;
const appRoot = isPackaged ? app.getAppPath() : path.resolve(__dirname, '..');
const setupScript = path.join(appRoot, 'scripts', 'water-gym-setup.mjs');
const manifestPath = path.join(appRoot, 'water-gym.manifest.json');
const sitePath = path.join(appRoot, 'index.html');
const localRuntimeDir = path.join(app.getPath('userData'), 'runtime');
const localOpenClawCli = path.join(localRuntimeDir, 'node_modules', 'openclaw', 'openclaw.mjs');
const localStateDir = path.join(appRoot, '.water-gym');
const localConfigPath = path.join(localStateDir, 'config.json');
const credentialsPath = path.join(localStateDir, 'credentials.bin');
const appIconPath = path.join(__dirname, 'assets', 'sprites-gym.ico');
const commsStore = createCommsStore(localStateDir);
const activeSpriteTurns = new Set();
const MAX_USER_MESSAGE_CHARS = 8000;
const MAX_STATUS_CHARS = 2000;
const SPRITE_TURN_TIMEOUT_MS = 190000;
const BOOTSTRAP_TIMEOUT_MS = 180000;
const OPENCLAW_RUNTIME_VERSION = '2026.5.7';
const COMMAND_CENTER_INVARIANT = 'System boundary: all Sprites Gym user/sprite communication must remain inside The Command Center. Do not deliver, route, suggest, or depend on Telegram, Discord, email, social DMs, or any external chat lane.';

function clipText(text, max = MAX_STATUS_CHARS) {
  const value = String(text || '').trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max - 24)}… [truncated]`;
}

function cleanUserMessage(text) {
  return clipText(text, MAX_USER_MESSAGE_CHARS);
}

function readManifest() {
  try { return JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch { return { abilities: [], agents: [] }; }
}

function listAbilities() {
  const manifest = readManifest();
  const agents = new Map((manifest.agents || []).map((agent) => [agent.id, agent]));
  return (manifest.abilities || []).map((ability) => ({
    ...ability,
    agents: ability.agents || [],
    agentNames: (ability.agents || []).map((id) => agents.get(id)?.name || id),
  }));
}

function approvalRequested(text) {
  return /\b(NEEDS_APPROVAL|APPROVAL_REQUIRED|REQUEST_APPROVAL)\b/i.test(String(text || ''));
}

function commandCenterPrompt(text) {
  return `${COMMAND_CENTER_INVARIANT}\n\n${text}`;
}

function commandFailureText(result) {
  if (result.error) return result.error;
  if (result.timedOut) return `Sprite runtime timed out after ${Math.round(SPRITE_TURN_TIMEOUT_MS / 1000)} seconds.`;
  return clipText(result.stderr || result.stdout || `Sprite runtime exited with code ${result.code ?? 'unknown'}.`);
}


function readLocalConfig() {
  if (!fs.existsSync(localConfigPath)) {
    return {
      schema: 'water-gym.local-config.v0',
      createdAt: new Date().toISOString(),
      allowedFolders: [],
    };
  }

  try {
    const config = JSON.parse(fs.readFileSync(localConfigPath, 'utf8'));
    if (!Array.isArray(config.allowedFolders)) config.allowedFolders = [];
    return config;
  } catch {
    return {
      schema: 'water-gym.local-config.v0',
      createdAt: new Date().toISOString(),
      allowedFolders: [],
    };
  }
}

function writeLocalConfig(config) {
  fs.mkdirSync(localStateDir, { recursive: true });
  fs.writeFileSync(localConfigPath, JSON.stringify(config, null, 2), 'utf8');
}

function credentialStatus() {
  return {
    ok: true,
    available: safeStorage.isEncryptionAvailable(),
    configured: fs.existsSync(credentialsPath),
    path: credentialsPath,
  };
}

function saveApiKey(apiKey) {
  const value = String(apiKey || '').trim();
  if (!value) return { ok: false, error: 'API key is required.' };
  if (!safeStorage.isEncryptionAvailable()) return { ok: false, error: 'Secure credential storage is not available on this system.' };
  fs.mkdirSync(localStateDir, { recursive: true });
  fs.writeFileSync(credentialsPath, safeStorage.encryptString(value));
  const config = readLocalConfig();
  config.apiKeyConfigured = true;
  config.keyStorage = 'electron-safeStorage';
  config.updatedAt = new Date().toISOString();
  writeLocalConfig(config);
  return credentialStatus();
}

function clearApiKey() {
  if (fs.existsSync(credentialsPath)) fs.rmSync(credentialsPath, { force: true });
  const config = readLocalConfig();
  config.apiKeyConfigured = false;
  config.keyStorage = 'not-configured';
  config.updatedAt = new Date().toISOString();
  writeLocalConfig(config);
  return credentialStatus();
}

function readApiKey() {
  if (!fs.existsSync(credentialsPath) || !safeStorage.isEncryptionAvailable()) return null;
  try { return safeStorage.decryptString(fs.readFileSync(credentialsPath)); } catch { return null; }
}

function normalizeFolder(folderPath) {
  if (!folderPath || typeof folderPath !== 'string') return null;
  return path.resolve(folderPath);
}

function listAllowedFolders() {
  const config = readLocalConfig();
  return (config.allowedFolders || []).map((folder) => ({
    path: folder.path,
    access: folder.access || 'read',
    source: folder.source || 'user-granted',
    grantedAt: folder.grantedAt,
    exists: fs.existsSync(folder.path),
  }));
}

function addAllowedFolder(folderPath) {
  const normalized = normalizeFolder(folderPath);
  if (!normalized) return { ok: false, error: 'No folder path supplied.' };
  if (!fs.existsSync(normalized) || !fs.statSync(normalized).isDirectory()) {
    return { ok: false, error: `Not a folder: ${normalized}` };
  }

  const config = readLocalConfig();
  const allowedFolders = Array.isArray(config.allowedFolders) ? config.allowedFolders : [];
  const existing = allowedFolders.find((folder) => folder.path.toLowerCase() === normalized.toLowerCase());
  if (!existing) {
    allowedFolders.push({
      path: normalized,
      access: 'read',
      source: 'user-granted',
      grantedAt: new Date().toISOString(),
    });
  }
  config.allowedFolders = allowedFolders;
  config.updatedAt = new Date().toISOString();
  writeLocalConfig(config);
  return { ok: true, folders: listAllowedFolders() };
}

function removeAllowedFolder(folderPath) {
  const normalized = normalizeFolder(folderPath);
  if (!normalized) return { ok: false, error: 'No folder path supplied.' };
  const config = readLocalConfig();
  config.allowedFolders = (config.allowedFolders || []).filter((folder) => folder.path.toLowerCase() !== normalized.toLowerCase());
  config.updatedAt = new Date().toISOString();
  writeLocalConfig(config);
  return { ok: true, folders: listAllowedFolders() };
}

function inventoryAllowedFolders() {
  const allowedFolders = listAllowedFolders().filter((folder) => folder.exists);
  return allowedFolders.map((folder) => {
    if (!isPathAllowed(folder.path, allowedFolders, appRoot)) {
      return { ok: false, root: folder.path, error: 'Folder is not inside the allowed-folder set.' };
    }
    return scanFolderInventory(folder.path, { maxFiles: 400, maxDepth: 4 });
  });
}

function healthCheck() {
  const config = readLocalConfig();
  const manifest = readManifest();
  const checks = [
    { id: 'app-root', label: 'App root available', ok: fs.existsSync(appRoot), detail: appRoot },
    { id: 'manifest', label: 'Sprites Gym manifest available', ok: fs.existsSync(manifestPath), detail: manifestPath },
    { id: 'setup-script', label: 'Setup/repair script available', ok: fs.existsSync(setupScript), detail: setupScript },
    { id: 'local-config', label: 'Local config readable', ok: !!config.schema, detail: localConfigPath },
    { id: 'agents', label: 'Manifest includes sprite roster', ok: Array.isArray(manifest.agents) && manifest.agents.length >= 7, detail: `${manifest.agents?.length || 0} sprites` },
    { id: 'abilities', label: 'Manifest includes abilities', ok: Array.isArray(manifest.abilities) && manifest.abilities.length > 0, detail: `${manifest.abilities?.length || 0} abilities` },
    { id: 'allowed-folders', label: 'Allowed folders checked', ok: true, detail: `${listAllowedFolders().filter((folder) => folder.exists).length}/${listAllowedFolders().length} found` },
    { id: 'bundled-runtime', label: 'Bundled OpenClaw runtime present', ok: fs.existsSync(localOpenClawCli), detail: fs.existsSync(localOpenClawCli) ? localOpenClawCli : 'Missing; installer can bootstrap as POC fallback.' },
    { id: 'credential-store', label: 'Secure credential storage available', ok: safeStorage.isEncryptionAvailable(), detail: credentialStatus().configured ? 'API key saved locally with safeStorage.' : 'No API key saved yet.' },
  ];
  return { ok: checks.every((check) => check.ok || check.id === 'bundled-runtime'), checks };
}

function createWindow() {
  const win = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 820,
    minHeight: 620,
    title: 'Sprites Gym Installer',
    icon: appIconPath,
    backgroundColor: '#0a1628',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'wizard.html'));
}

function runNodeScript(args, env = {}, onLog) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [setupScript, ...args], {
      cwd: appRoot,
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', ...env },
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      onLog?.(text);
    });
    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      onLog?.(text);
    });
    child.on('close', (code) => resolve({ ok: code === 0, code, stdout, stderr }));
  });
}

function tryParseJson(text) {
  const value = String(text || '').trim();
  if (!value) return null;
  try { return JSON.parse(value); } catch {}
  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).reverse();
  for (const line of lines) {
    if (!line.startsWith('{') && !line.startsWith('[')) continue;
    try { return JSON.parse(line); } catch {}
  }
  return null;
}

function resultTextFromAgentJson(parsed, stdout) {
  if (!parsed) return stdout.trim();
  return parsed.text
    || parsed.reply
    || parsed.message
    || parsed.output
    || parsed.response
    || parsed.result?.text
    || parsed.result?.reply
    || parsed.result?.payloads?.find?.((payload) => payload.text)?.text
    || parsed.result?.meta?.finalAssistantVisibleText
    || parsed.result?.meta?.finalAssistantRawText
    || parsed.assistant?.text
    || stdout.trim();
}

function channelTarget(channelId) {
  const channel = commsStore.readChannels().find((item) => item.id === channelId);
  if (channel?.spriteId) return { spriteId: channel.spriteId, name: channel.name };
  return { spriteId: 'water-marina', name: 'Marina' };
}

async function runSpriteTurn(event, { channelId, text, taskId }) {
  const bootstrap = await ensureLocalOpenClaw(event);
  if (!bootstrap.ok) return { ok: false, error: bootstrap.error };

  const target = channelTarget(channelId);
  const sessionId = `sprites-gym-${channelId || 'command-center'}`.replace(/[^a-zA-Z0-9_-]/g, '-');
  const args = [
    'agent',
    '--agent', target.spriteId,
    '--session-id', sessionId,
    '--message', commandCenterPrompt(text),
    '--json',
    '--timeout', '180',
  ];

  const result = await new Promise((resolve) => {
    const useNode = bootstrap.cli.endsWith('.mjs') || bootstrap.cli.endsWith('.js');
    const command = useNode ? process.execPath : bootstrap.cli;
    const finalArgs = useNode ? [bootstrap.cli, ...args] : args;
    const child = spawn(command, finalArgs, {
      cwd: appRoot,
      env: process.env,
      windowsHide: true,
    });
    let settled = false;
    let stdout = '';
    let stderr = '';
    const finish = (payload) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(payload);
    };
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      finish({ ok: false, code: null, stdout, stderr, timedOut: true });
    }, SPRITE_TURN_TIMEOUT_MS);
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (error) => finish({ ok: false, code: null, stdout, stderr, error: error.message }));
    child.on('close', (code) => finish({ ok: code === 0, code, stdout, stderr }));
  });

  const parsed = tryParseJson(result.stdout);
  const replyText = resultTextFromAgentJson(parsed, result.stdout);
  if (result.ok && replyText) {
    commsStore.appendMessage({
      channelId,
      role: 'sprite',
      authorId: target.spriteId,
      authorName: target.name,
      text: replyText,
      taskId,
      eventType: approvalRequested(replyText) ? 'needs-approval' : 'sprite-output',
      status: approvalRequested(replyText) ? 'needs-approval' : null,
    });
  } else if (!result.ok) {
    commsStore.appendMessage({
      channelId,
      role: 'system',
      authorId: 'command-center',
      authorName: 'The Command Center',
      text: `Sprite routing failed: ${commandFailureText(result)}`,
      taskId,
      eventType: 'sprite-error',
      status: 'blocked',
    });
  }

  if (result.ok && !replyText) {
    result.ok = false;
    result.error = 'Sprite runtime completed without a readable reply.';
    commsStore.appendMessage({
      channelId,
      role: 'system',
      authorId: 'command-center',
      authorName: 'The Command Center',
      text: result.error,
      taskId,
      eventType: 'sprite-empty-output',
      status: 'blocked',
    });
  }

  return { ...result, parsed, replyText, target, needsApproval: result.ok && approvalRequested(replyText) };
}

async function ensureLocalOpenClaw(event) {
  if (fs.existsSync(localOpenClawCli)) {
    return { ok: true, cli: localOpenClawCli, installed: false };
  }

  // POC bootstrap: use npm when available to install OpenClaw into the app's userData runtime,
  // not globally. Final installer should bundle this runtime to avoid network/npm dependency.
  event.sender.send('setup:log', 'Bootstrapping OpenClaw into Sprites Gym runtime...\n');
  fs.mkdirSync(localRuntimeDir, { recursive: true });

  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = await new Promise((resolve) => {
    const child = spawn(npmCommand, ['install', `openclaw@${OPENCLAW_RUNTIME_VERSION}`], {
      cwd: localRuntimeDir,
      env: process.env,
      windowsHide: true,
    });
    let settled = false;
    let stdout = '';
    let stderr = '';
    const finish = (payload) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(payload);
    };
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      finish({ ok: false, code: null, stdout, stderr, timedOut: true, error: 'OpenClaw runtime bootstrap timed out.' });
    }, BOOTSTRAP_TIMEOUT_MS);
    child.stdout.on('data', (chunk) => { const text = chunk.toString(); stdout += text; event.sender.send('setup:log', text); });
    child.stderr.on('data', (chunk) => { const text = chunk.toString(); stderr += text; event.sender.send('setup:log', text); });
    child.on('error', (error) => finish({ ok: false, code: null, stdout, stderr, error: error.message }));
    child.on('close', (code) => finish({ ok: code === 0, code, stdout, stderr }));
  });

  if (!result.ok || !fs.existsSync(localOpenClawCli)) {
    return { ok: false, error: result.error || result.stderr || result.stdout || 'OpenClaw bootstrap failed.' };
  }

  return { ok: true, cli: localOpenClawCli, installed: true };
}

ipcMain.handle('setup:dry-run', async (event) => {
  commsStore.upsertTask({ title: 'Setup check', status: 'running' });
  const result = await runNodeScript(['--dry-run', '--json'], {}, (line) => event.sender.send('setup:log', line));
  commsStore.upsertTask({ title: 'Setup check', status: result.ok ? 'complete' : 'blocked', summary: result.ok ? 'Dry-run completed.' : result.stderr });
  return { ...result, report: tryParseJson(result.stdout) };
});

ipcMain.handle('setup:apply', async (event, options = {}) => {
  const bootstrap = await ensureLocalOpenClaw(event);
  if (!bootstrap.ok) return { ok: false, error: bootstrap.error };

  const args = ['--apply', '--skip-key-validation', '--openclaw-cli', bootstrap.cli];
  if (options.provider) args.push('--provider', options.provider);
  if (options.model) args.push('--model', options.model);
  if (options.launchUi) args.push('--launch-ui');

  commsStore.upsertTask({ title: 'Install / repair Sprites Gym', status: 'running', assignedSprites: ['water-marina'] });
  const apiKey = readApiKey();
  const result = await runNodeScript(args, apiKey ? { WATER_GYM_API_KEY: apiKey } : {}, (line) => event.sender.send('setup:log', line));
  commsStore.upsertTask({ title: 'Install / repair Sprites Gym', status: result.ok ? 'complete' : 'blocked', assignedSprites: ['water-marina'], summary: result.ok ? 'Setup applied.' : result.stderr });
  return { ...result, bootstrap };
});

ipcMain.handle('app:open-site', async () => {
  await shell.openPath(sitePath);
  return { ok: true, path: sitePath };
});

ipcMain.handle('health:check', async () => healthCheck());

ipcMain.handle('credentials:status', async () => credentialStatus());

ipcMain.handle('credentials:save', async (_event, apiKey) => saveApiKey(apiKey));

ipcMain.handle('credentials:clear', async () => clearApiKey());

ipcMain.handle('folders:list', async () => ({ ok: true, folders: listAllowedFolders() }));

ipcMain.handle('folders:add', async (_event, folderPath) => addAllowedFolder(folderPath));

ipcMain.handle('folders:remove', async (_event, folderPath) => removeAllowedFolder(folderPath));

ipcMain.handle('folders:inventory', async () => ({ ok: true, inventories: inventoryAllowedFolders() }));

ipcMain.handle('folders:choose', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Allow Sprites Gym to use this folder',
    properties: ['openDirectory'],
  });
  if (result.canceled || !result.filePaths[0]) return { ok: false, canceled: true, folders: listAllowedFolders() };
  return addAllowedFolder(result.filePaths[0]);
});

ipcMain.handle('comms:snapshot', async (_event, channelId) => commsStore.snapshot(channelId || 'command-center'));

ipcMain.handle('comms:messages', async (_event, channelId, limit) => ({
  ok: true,
  messages: commsStore.readMessages(channelId || 'command-center', limit || 120),
}));

ipcMain.handle('comms:send', async (event, input = {}) => {
  const channelId = input.channelId || 'command-center';
  const text = cleanUserMessage(input.text);
  if (!text) return { ok: false, error: 'Message text is required.' };

  const target = channelTarget(channelId);
  const turnKey = `${channelId}:${target.spriteId}`;
  if (activeSpriteTurns.has(turnKey)) {
    return { ok: false, error: `${target.name} is already working in this channel. Wait for that turn to finish before sending another message.` };
  }
  activeSpriteTurns.add(turnKey);

  const userMessage = commsStore.appendMessage({
    channelId,
    role: 'user',
    authorId: 'user',
    authorName: 'You',
    text,
    eventType: 'user-message',
  });
  if (!userMessage.ok) {
    activeSpriteTurns.delete(turnKey);
    return userMessage;
  }

  const task = commsStore.upsertTask({
    title: `Message ${target.name}`,
    status: 'running',
    channelId,
    assignedSprites: [target.spriteId],
    summary: text,
  }).task;

  commsStore.appendMessage({
    channelId,
    role: 'system',
    authorId: 'command-center',
    authorName: 'The Command Center',
    text: `Routing your message to ${target.name} inside The Command Center.`,
    taskId: task.id,
    eventType: 'sprite-routing',
    status: 'running',
  });

  try {
    const spriteResult = await runSpriteTurn(event, { channelId, text, taskId: task.id });
    const failureText = commandFailureText(spriteResult);
    commsStore.upsertTask({
      id: task.id,
      title: task.title,
      status: spriteResult.needsApproval ? 'needs-approval' : (spriteResult.ok ? 'complete' : 'blocked'),
      channelId,
      assignedSprites: [target.spriteId],
      summary: spriteResult.needsApproval ? 'Sprite is waiting for approval.' : (spriteResult.ok ? 'Sprite response received.' : failureText),
    });

    return { ok: spriteResult.ok, needsApproval: spriteResult.needsApproval, userMessage: userMessage.message, taskId: task.id, target, replyText: spriteResult.replyText, error: spriteResult.ok ? null : failureText };
  } finally {
    activeSpriteTurns.delete(turnKey);
  }
});

ipcMain.handle('comms:task', async (_event, input = {}) => {
  // Renderer-created tasks are user-visible only; system status events are created by main-process flows.
  const allowedStatuses = new Set(['queued', 'running', 'needs-approval', 'blocked', 'complete', 'canceled']);
  return commsStore.upsertTask({
    id: input.id,
    title: clipText(input.title || 'User task', 160),
    abilityId: input.abilityId ? clipText(input.abilityId, 120) : null,
    channelId: input.channelId || 'command-center',
    status: allowedStatuses.has(input.status) ? input.status : 'queued',
    assignedSprites: Array.isArray(input.assignedSprites) ? input.assignedSprites.slice(0, 12) : [],
    summary: clipText(input.summary || '', 2000),
  });
});

ipcMain.handle('abilities:list', async () => ({ ok: true, abilities: listAbilities() }));

ipcMain.handle('abilities:start', async (event, input = {}) => {
  const abilityId = clipText(input.abilityId, 120);
  const ability = listAbilities().find((item) => item.id === abilityId);
  if (!ability) return { ok: false, error: `Unknown ability: ${abilityId || '(none)'}` };

  const channelId = 'command-center';
  const turnKey = `${channelId}:ability:${ability.id}`;
  if (activeSpriteTurns.has(turnKey)) {
    return { ok: false, error: `${ability.name} is already running. Wait for that quest to finish or request cancellation.` };
  }
  activeSpriteTurns.add(turnKey);

  const userBrief = cleanUserMessage(input.brief || 'Start this ability with sensible defaults. Ask for approval before making changes or publishing anything.');
  const task = commsStore.upsertTask({
    title: ability.name,
    abilityId: ability.id,
    status: 'running',
    channelId,
    assignedSprites: ability.agents,
    summary: userBrief,
  }).task;

  commsStore.appendMessage({
    channelId,
    role: 'user',
    authorId: 'user',
    authorName: 'You',
    text: `Start ability: ${ability.name}\n\n${userBrief}`,
    taskId: task.id,
    eventType: 'ability-start',
  });

  const prompt = [
    `You are Marina coordinating a Sprites Gym ability inside The Command Center.`,
    `Ability: ${ability.name} (${ability.id})`,
    `Assigned sprites: ${ability.agentNames.join(', ')}`,
    `User brief: ${userBrief}`,
    `Return progress and either a useful next output or an approval request.`,
    `If user approval is required before file changes, publishing, or external actions, include the marker NEEDS_APPROVAL: followed by the exact question/options.`,
    `All communication must remain in The Command Center. Do not deliver to Telegram, Discord, email, or any external channel.`,
  ].join('\n');

  try {
    const result = await runSpriteTurn(event, { channelId, text: prompt, taskId: task.id });
    const failureText = commandFailureText(result);
    commsStore.upsertTask({
      id: task.id,
      title: task.title,
      abilityId: ability.id,
      status: result.needsApproval ? 'needs-approval' : (result.ok ? 'complete' : 'blocked'),
      channelId,
      assignedSprites: ability.agents,
      summary: result.needsApproval ? 'Ability is waiting for approval.' : (result.ok ? 'Ability run produced an initial response.' : failureText),
    });

    return { ok: result.ok, needsApproval: result.needsApproval, taskId: task.id, ability, replyText: result.replyText, error: result.ok ? null : failureText };
  } finally {
    activeSpriteTurns.delete(turnKey);
  }
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
