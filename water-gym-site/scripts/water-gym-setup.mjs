#!/usr/bin/env node
import { execFileSync, spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const manifestPath = join(projectRoot, 'water-gym.manifest.json');
const localStateDir = join(projectRoot, '.water-gym');
const localConfigPath = join(localStateDir, 'config.json');
const waterAgentPrefix = 'water-';
const openclawConfigPath = join(os.homedir(), '.openclaw', 'openclaw.json');

function parseArgs(argv) {
  const options = {
    apply: false,
    dryRun: true,
    json: false,
    launchUi: false,
    skipKeyValidation: false,
    installOpenClaw: false,
    provider: process.env.WATER_GYM_PROVIDER || undefined,
    model: process.env.WATER_GYM_MODEL || undefined,
    apiKey: process.env.WATER_GYM_API_KEY || undefined,
    openclawCli: process.env.OPENCLAW_CLI || undefined,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--apply') { options.apply = true; options.dryRun = false; continue; }
    if (arg === '--dry-run') { options.apply = false; options.dryRun = true; continue; }
    if (arg === '--json') { options.json = true; continue; }
    if (arg === '--launch-ui') { options.launchUi = true; continue; }
    if (arg === '--skip-key-validation') { options.skipKeyValidation = true; continue; }
    if (arg === '--install-openclaw') { options.installOpenClaw = true; continue; }
    if (arg.startsWith('--provider=')) { options.provider = arg.slice('--provider='.length); continue; }
    if (arg === '--provider') { options.provider = argv[++i]; continue; }
    if (arg.startsWith('--model=')) { options.model = arg.slice('--model='.length); continue; }
    if (arg === '--model') { options.model = argv[++i]; continue; }
    if (arg.startsWith('--api-key=')) { options.apiKey = arg.slice('--api-key='.length); continue; }
    if (arg === '--api-key') { options.apiKey = argv[++i]; continue; }
    if (arg.startsWith('--openclaw-cli=')) { options.openclawCli = arg.slice('--openclaw-cli='.length); continue; }
    if (arg === '--openclaw-cli') { options.openclawCli = argv[++i]; continue; }
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
    throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`Sprites Gym setup orchestrator\n\nUsage:\n  npm run setup:dry-run\n  npm run setup:apply -- --provider openai-codex --model openai-codex/gpt-5.5\n  node scripts/water-gym-setup.mjs --apply --provider openai --model gpt-5.1 --api-key sk-...\n\nOptions:\n  --dry-run              Show what would happen. Default.\n  --apply                Create/update local OpenClaw agents and config.\n  --provider <id>        Provider label to store in local config.\n  --model <id>           Model to assign to every Sprites Gym agent for MVP.\n  --api-key <key>        Optional key presence check. Not written to config. Prefer WATER_GYM_API_KEY env.\n  --skip-key-validation  Do not require an API key for this local setup pass.\n  --install-openclaw     If OpenClaw is missing, install it with npm install -g openclaw. Apply mode only.\n  --launch-ui            Open index.html after setup.\n  --json                 Print machine-readable report.\n`);
}

function expandHome(value) {
  if (!value) return value;
  if (value === '~') return os.homedir();
  if (value.startsWith('~/') || value.startsWith('~\\')) return join(os.homedir(), value.slice(2));
  return value;
}

function readManifest() {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const agent of manifest.agents || []) {
    if (!agent.id?.startsWith(waterAgentPrefix)) {
      throw new Error(`Sprites Gym agent id must start with ${waterAgentPrefix}: ${agent.id}`);
    }
  }
  return manifest;
}

function resolveOpenClawCli(options) {
  const candidates = [
    options.openclawCli,
    process.env.OPENCLAW_CLI,
    join(process.env.APPDATA || join(os.homedir(), 'AppData', 'Roaming'), 'npm', 'node_modules', 'openclaw', 'openclaw.mjs'),
    'openclaw',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate === 'openclaw') return candidate;
    if (existsSync(candidate)) return candidate;
  }
  return candidates.at(-1);
}

function runNpm(args, options = {}) {
  return execFileSync('npm', args, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
    timeout: options.timeout || 300_000,
  });
}

function installOpenClawIfRequested(options, actions) {
  if (!options.installOpenClaw) return { attempted: false };
  if (!options.apply) {
    actions.push({ type: 'warning', message: '--install-openclaw only runs with --apply. Dry-run will not download packages.' });
    return { attempted: false, skipped: true };
  }

  actions.push({ type: 'install-openclaw', package: 'openclaw', command: 'npm install -g openclaw' });
  runNpm(['install', '-g', 'openclaw'], { stdio: 'pipe', timeout: 600_000 });
  return { attempted: true };
}

function runOpenClaw(openclawCli, args, options = {}) {
  const useNode = openclawCli.endsWith('.mjs') || openclawCli.endsWith('.js');
  const command = useNode ? process.execPath : openclawCli;
  const finalArgs = useNode ? [openclawCli, ...args] : args;
  return execFileSync(command, finalArgs, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
    timeout: options.timeout || 120_000,
  });
}

function getExistingAgents(openclawCli) {
  try {
    const stdout = runOpenClaw(openclawCli, ['agents', 'list', '--json']);
    return JSON.parse(stdout);
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error), agents: [] };
  }
}

function normalizePathForCompare(value) {
  return resolve(expandHome(value || '')).toLowerCase();
}

function backupOpenClawConfigIfApplying(apply, actions) {
  if (!apply) return;
  if (!existsSync(openclawConfigPath)) {
    actions.push({ type: 'warning', message: 'OpenClaw config file was not found before setup; no backup created.' });
    return;
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = join(localStateDir, 'backups');
  mkdirSync(backupDir, { recursive: true });
  const backupPath = join(backupDir, `openclaw.${stamp}.json`);
  copyFileSync(openclawConfigPath, backupPath);
  actions.push({ type: 'backup-openclaw-config', path: backupPath });
}

function writeAgentWorkspace(agent, model, provider) {
  const workspace = expandHome(agent.workspace);
  mkdirSync(workspace, { recursive: true });

  const identity = `# IDENTITY.md\n\n- **Name:** ${agent.name}\n- **Sprite:** Sprites Gym sprite-agent\n- **Role:** ${agent.role}\n- **Specialty:** ${agent.specialty}\n- **Emoji:** ${agent.emoji}\n- **Quote:** ${agent.quote}\n`;

  const instructions = `# AGENTS.md â€” ${agent.name}\n\nYou are ${agent.name}, part of Marina's Sprites Gym.\n\n## Role\n${agent.role}\n\n## Specialty\n${agent.specialty}\n\n## Operating rules\n- Stay inside your Sprites Gym specialty unless Marina delegates otherwise.\n- Keep outputs practical, reviewable, and usable by nontechnical users.\n- Collaborate visibly through the Command Center when runtime support is enabled.\n- Do not publish, schedule, or send external content without explicit user approval.\n- Current provider target: ${provider}.\n- Current model target: ${model}.\n`;

  writeFileSync(join(workspace, 'IDENTITY.md'), identity, 'utf8');
  writeFileSync(join(workspace, 'AGENTS.md'), instructions, 'utf8');
}

function createOrUpdateAgent(openclawCli, agent, model, provider, existingById, apply) {
  const workspace = expandHome(agent.workspace);
  const actions = [];
  const existing = existingById.get(agent.id);

  if (existing?.workspace && normalizePathForCompare(existing.workspace) !== normalizePathForCompare(workspace)) {
    throw new Error(`Refusing to touch existing agent ${agent.id}: workspace is ${existing.workspace}, expected ${workspace}. This prevents overwriting a user's existing OpenClaw agent.`);
  }

  if (!existing) {
    actions.push({ type: 'create-agent', id: agent.id, workspace, model });
    if (apply) {
      mkdirSync(workspace, { recursive: true });
      runOpenClaw(openclawCli, ['agents', 'add', agent.id, '--workspace', workspace, '--model', model, '--non-interactive', '--json'], { timeout: 180_000 });
    }
  } else {
    actions.push({ type: 'agent-exists', id: agent.id, workspace, model });
  }

  actions.push({ type: 'write-workspace-files', id: agent.id, workspace });
  actions.push({ type: 'set-identity', id: agent.id, name: agent.name, emoji: agent.emoji });

  if (apply) {
    writeAgentWorkspace(agent, model, provider);
    try {
      runOpenClaw(openclawCli, ['agents', 'set-identity', '--agent', agent.id, '--name', agent.name, '--emoji', agent.emoji, '--theme', agent.role, '--json'], { timeout: 60_000 });
    } catch (error) {
      actions.push({ type: 'warning', id: agent.id, message: `set-identity failed: ${error instanceof Error ? error.message : String(error)}` });
    }
  }

  return actions;
}

function readExistingLocalConfig() {
  if (!existsSync(localConfigPath)) return {};
  try {
    return JSON.parse(readFileSync(localConfigPath, 'utf8'));
  } catch {
    return {};
  }
}

function normalizeAllowedFolders(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const folders = [];
  for (const item of value) {
    const folderPath = typeof item === 'string' ? item : item?.path;
    if (!folderPath) continue;
    const normalized = resolve(expandHome(folderPath));
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    folders.push({
      path: normalized,
      access: item?.access || 'read',
      source: item?.source || 'user-granted',
      grantedAt: item?.grantedAt || new Date().toISOString(),
    });
  }
  return folders;
}

function writeLocalConfig(manifest, provider, model, keyConfigured, apply) {
  const existingConfig = readExistingLocalConfig();
  const config = {
    schema: 'water-gym.local-config.v0',
    createdAt: new Date().toISOString(),
    gymId: manifest.gym.id,
    gymVersion: manifest.gym.version,
    provider,
    model,
    singleModelMode: true,
    apiKeyConfigured: keyConfigured,
    keyStorage: keyConfigured ? 'external/env-or-secure-store-required' : 'not-configured',
    manifestPath,
    allowedFolders: normalizeAllowedFolders(existingConfig.allowedFolders),
    agents: manifest.agents.map((agent) => ({ id: agent.id, name: agent.name, workspace: expandHome(agent.workspace) })),
    abilities: manifest.abilities,
  };

  if (apply) {
    mkdirSync(localStateDir, { recursive: true });
    writeFileSync(localConfigPath, JSON.stringify(config, null, 2), 'utf8');
  }

  return config;
}

function launchUiIfRequested(launchUi, apply) {
  if (!launchUi) return { skipped: true };
  if (!apply) return { skipped: true, reason: 'dry-run' };
  const indexPath = join(projectRoot, 'index.html');
  const command = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', indexPath] : [indexPath];
  const child = spawn(command, args, { detached: true, stdio: 'ignore' });
  child.unref();
  return { launched: true, path: indexPath };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const manifest = readManifest();
  const provider = options.provider || manifest.defaults.provider;
  const model = options.model || manifest.defaults.model;
  const keyConfigured = Boolean(options.apiKey);
  let openclawCli = resolveOpenClawCli(options);
  let existingResult = getExistingAgents(openclawCli);
  const actions = [];

  if (!Array.isArray(existingResult) && existingResult.error) {
    actions.push({ type: 'detect-openclaw', cli: openclawCli, ok: false, error: existingResult.error });
    installOpenClawIfRequested(options, actions);
    openclawCli = resolveOpenClawCli(options);
    existingResult = getExistingAgents(openclawCli);
  }

  const existingAgents = Array.isArray(existingResult) ? existingResult : [];
  const existingById = new Map(existingAgents.filter((agent) => agent.id).map((agent) => [agent.id, agent]));
  const keyWarning = !keyConfigured && !options.skipKeyValidation
    ? 'No API key supplied. MVP setup can continue, but provider validation is pending. Use WATER_GYM_API_KEY or --api-key later.'
    : null;

  actions.unshift({ type: 'detect-node', version: process.version, ok: Number(process.versions.node.split('.')[0]) >= 20 });
  if (!actions.some((action) => action.type === 'detect-openclaw')) {
    actions.push({ type: 'detect-openclaw', cli: openclawCli, ok: !existingResult.error, error: existingResult.error });
  }
  if (keyWarning) actions.push({ type: 'warning', message: keyWarning });
  backupOpenClawConfigIfApplying(options.apply, actions);

  for (const agent of manifest.agents) {
    actions.push(...createOrUpdateAgent(openclawCli, agent, model, provider, existingById, options.apply));
  }

  const config = writeLocalConfig(manifest, provider, model, keyConfigured, options.apply);
  actions.push({ type: 'write-local-config', path: localConfigPath, applied: options.apply });
  const ui = launchUiIfRequested(options.launchUi, options.apply);
  actions.push({ type: 'launch-ui', ...ui });

  const report = {
    ok: !existingResult.error,
    mode: options.apply ? 'apply' : 'dry-run',
    projectRoot,
    manifestPath,
    provider,
    model,
    apiKeyConfigured: keyConfigured,
    localConfigPath,
    agentCount: manifest.agents.length,
    actions,
    configPreview: options.apply ? undefined : config,
  };

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`\nSprites Gym setup (${report.mode})`);
  console.log(`Provider: ${provider}`);
  console.log(`Model:    ${model}`);
  console.log(`Agents:   ${manifest.agents.length}`);
  console.log(`OpenClaw: ${openclawCli}`);
  console.log('');

  for (const action of actions) {
    if (action.type === 'warning') console.log(`[warn] ${action.message}`);
    else if (action.type === 'create-agent') console.log(`${options.apply ? '[ok]' : '[plan]'} create ${action.id} -> ${action.workspace}`);
    else if (action.type === 'agent-exists') console.log(`[ok] exists ${action.id}`);
    else if (action.type === 'write-workspace-files') console.log(`${options.apply ? '[ok]' : '[plan]'} write workspace files for ${action.id}`);
    else if (action.type === 'set-identity') console.log(`${options.apply ? '[ok]' : '[plan]'} set identity ${action.id} (${action.name})`);
    else if (action.type === 'write-local-config') console.log(`${options.apply ? '[ok]' : '[plan]'} write config ${action.path}`);
    else if (action.type === 'backup-openclaw-config') console.log(`[ok] backed up existing OpenClaw config to ${action.path}`);
    else if (action.type === 'launch-ui') console.log(action.launched ? `[ok] launch UI ${action.path}` : `[plan] UI launch skipped${action.reason ? ` (${action.reason})` : ''}`);
    else if (action.type === 'install-openclaw') console.log(`${options.apply ? '[ok]' : '[plan]'} install OpenClaw via ${action.command}`);
    else if (action.type === 'detect-node') console.log(`${action.ok ? '[ok]' : '[fail]'} Node ${action.version}`);
    else if (action.type === 'detect-openclaw') console.log(`${action.ok ? '[ok]' : '[fail]'} OpenClaw detected`);
  }

  console.log(options.apply ? '\nSetup applied.' : '\nDry run only. Re-run with --apply to write agents/config.');
}

try {
  main();
} catch (error) {
  console.error(`Sprites Gym setup failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}


