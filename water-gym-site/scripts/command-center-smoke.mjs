#!/usr/bin/env node
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { createCommsStore } = require('../installer/comms-store.cjs');
const { isPathAllowed, scanFolderInventory } = require('../installer/allowed-folders.cjs');

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const stateDir = join(projectRoot, '.water-gym-smoke');

if (existsSync(stateDir)) rmSync(stateDir, { recursive: true, force: true });
mkdirSync(stateDir, { recursive: true });

const store = createCommsStore(stateDir);
const snapshot = store.snapshot();
if (!snapshot.ok) throw new Error('Snapshot failed.');
if (!snapshot.channels.some((channel) => channel.id === 'command-center')) throw new Error('Missing command-center channel.');
if (!snapshot.channels.some((channel) => channel.spriteId === 'water-marina')) throw new Error('Missing Marina channel.');

const message = store.appendMessage({
  channelId: 'command-center',
  role: 'user',
  authorId: 'user',
  authorName: 'Smoke Test',
  text: 'Smoke message',
});
if (!message.ok) throw new Error(`Message write failed: ${message.error}`);

const task = store.upsertTask({
  title: 'Smoke task',
  status: 'running',
  assignedSprites: ['water-marina'],
});
if (!task.ok) throw new Error('Task upsert failed.');

const badStatus = store.upsertTask({ title: 'Bad status task', status: 'pwned' });
if (badStatus.task.status !== 'queued') throw new Error('Invalid task status was not sanitized.');

const allowedRoot = join(stateDir, 'allowed');
mkdirSync(allowedRoot, { recursive: true });
writeFileSync(join(allowedRoot, 'sample.md'), '# sample\n', 'utf8');
if (!isPathAllowed(join(allowedRoot, 'sample.md'), [{ path: allowedRoot }])) throw new Error('Allowed path check failed.');
if (isPathAllowed(projectRoot, [{ path: allowedRoot }])) throw new Error('Disallowed path check failed.');
const inventory = scanFolderInventory(allowedRoot);
if (!inventory.ok || inventory.fileCount !== 1) throw new Error('Inventory scan failed.');

const after = store.snapshot('command-center');
if (!after.messages.some((item) => item.text === 'Smoke message')) throw new Error('Smoke message missing.');
if (!after.tasks.some((item) => item.title === 'Smoke task')) throw new Error('Smoke task missing.');

rmSync(stateDir, { recursive: true, force: true });
console.log(JSON.stringify({ ok: true, channels: snapshot.channels.length, messages: after.messages.length, tasks: after.tasks.length, inventoryFiles: inventory.fileCount }, null, 2));
