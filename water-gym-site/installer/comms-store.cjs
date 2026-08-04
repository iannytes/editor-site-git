const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const MAX_TEXT_CHARS = 12000;
const MAX_SUMMARY_CHARS = 2000;
const VALID_STATUSES = new Set(['queued', 'running', 'needs-approval', 'blocked', 'complete', 'canceled']);
const VALID_ROLES = new Set(['system', 'user', 'sprite']);

function clip(value, max = MAX_TEXT_CHARS) {
  const text = String(value || '').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 24)}… [truncated]`;
}

function safeStatus(status, fallback = null) {
  if (!status) return fallback;
  return VALID_STATUSES.has(status) ? status : fallback;
}

const DEFAULT_CHANNELS = [
  {
    id: 'command-center',
    name: 'Command Center',
    kind: 'system',
    description: 'Main user-facing coordination feed for Sprites Gym.',
  },
  {
    id: 'marina',
    name: 'Marina',
    kind: 'sprite',
    spriteId: 'water-marina',
    description: 'Sprite Trainer / coordinator.',
  },
  {
    id: 'ripple',
    name: 'Ripple',
    kind: 'sprite',
    spriteId: 'water-ripple',
    description: 'Trend monitor.',
  },
  {
    id: 'tidebyte',
    name: 'Tidebyte',
    kind: 'sprite',
    spriteId: 'water-tidebyte',
    description: 'SEO optimizer.',
  },
  {
    id: 'squink',
    name: 'Squink',
    kind: 'sprite',
    spriteId: 'water-squink',
    description: 'Writer.',
  },
  {
    id: 'waveform',
    name: 'Waveform',
    kind: 'sprite',
    spriteId: 'water-waveform',
    description: 'Repurposer.',
  },
  {
    id: 'torrentail',
    name: 'Torrentail',
    kind: 'sprite',
    spriteId: 'water-torrentail',
    description: 'Analytics interpreter.',
  },
  {
    id: 'cascadex',
    name: 'Cascadex',
    kind: 'sprite',
    spriteId: 'water-cascadex',
    description: 'Scheduler.',
  },
];

function createCommsStore(stateDir) {
  const commsDir = path.join(stateDir, 'command-center');
  const channelsPath = path.join(commsDir, 'channels.json');
  const messagesPath = path.join(commsDir, 'messages.jsonl');
  const tasksPath = path.join(commsDir, 'tasks.json');

  function ensure() {
    fs.mkdirSync(commsDir, { recursive: true });
    if (!fs.existsSync(channelsPath)) {
      fs.writeFileSync(channelsPath, JSON.stringify(DEFAULT_CHANNELS, null, 2), 'utf8');
    }
    if (!fs.existsSync(messagesPath)) {
      appendMessage({
        channelId: 'command-center',
        role: 'system',
        authorId: 'system',
        authorName: 'The Command Center',
        text: 'Welcome to The Command Center. All sprite communication, approvals, progress, and outputs will appear here.',
        eventType: 'welcome',
      });
    }
    if (!fs.existsSync(tasksPath)) fs.writeFileSync(tasksPath, '[]\n', 'utf8');
  }

  function readJson(filePath, fallback) {
    try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (error) {
      if (fs.existsSync(filePath)) {
        const backupPath = `${filePath}.corrupt-${Date.now()}.bak`;
        try { fs.copyFileSync(filePath, backupPath); } catch {}
      }
      return fallback;
    }
  }

  function writeJsonAtomic(filePath, value) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(value, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
  }

  function readChannels() {
    ensure();
    return readJson(channelsPath, DEFAULT_CHANNELS);
  }

  function readMessages(channelId, limit = 100) {
    ensure();
    const lines = fs.readFileSync(messagesPath, 'utf8').split(/\r?\n/).filter(Boolean);
    const messages = [];
    for (const line of lines) {
      try {
        const message = JSON.parse(line);
        if (!channelId || message.channelId === channelId) messages.push(message);
      } catch {}
    }
    return messages.slice(-Math.max(1, Number(limit) || 100));
  }

  function appendMessage(input) {
    fs.mkdirSync(commsDir, { recursive: true });
    const message = {
      id: crypto.randomUUID(),
      channelId: input.channelId || 'command-center',
      role: VALID_ROLES.has(input.role) ? input.role : 'system',
      authorId: clip(input.authorId || input.role || 'system', 120),
      authorName: clip(input.authorName || input.authorId || 'System', 120),
      text: clip(input.text),
      taskId: input.taskId || null,
      eventType: clip(input.eventType || 'message', 80),
      status: safeStatus(input.status),
      createdAt: new Date().toISOString(),
    };
    if (!message.text) return { ok: false, error: 'Message text is required.' };
    fs.appendFileSync(messagesPath, `${JSON.stringify(message)}\n`, 'utf8');
    return { ok: true, message };
  }

  function readTasks() {
    ensure();
    return readJson(tasksPath, []);
  }

  function writeTasks(tasks) {
    writeJsonAtomic(tasksPath, tasks);
  }

  function upsertTask(input) {
    ensure();
    const tasks = readTasks();
    const now = new Date().toISOString();
    const taskId = input.id || crypto.randomUUID();
    const existing = tasks.find((task) => task.id === taskId);
    const task = {
      ...(existing || { id: taskId, createdAt: now }),
      title: clip(input.title || existing?.title || 'Untitled task', 160),
      abilityId: input.abilityId ? clip(input.abilityId, 120) : existing?.abilityId || null,
      channelId: clip(input.channelId || existing?.channelId || 'command-center', 120),
      status: safeStatus(input.status, existing?.status || 'queued'),
      assignedSprites: Array.isArray(input.assignedSprites) ? input.assignedSprites.map((id) => clip(id, 120)).slice(0, 12) : existing?.assignedSprites || [],
      summary: clip(input.summary || existing?.summary || '', MAX_SUMMARY_CHARS),
      updatedAt: now,
    };
    const shouldAnnounce = !existing || existing.status !== task.status || existing.summary !== task.summary;
    if (existing) Object.assign(existing, task); else tasks.push(task);
    writeTasks(tasks);
    if (shouldAnnounce) appendMessage({
      channelId: task.channelId,
      role: 'system',
      authorId: 'command-center',
      authorName: 'The Command Center',
      text: `${task.title} is ${task.status}.`,
      taskId: task.id,
      eventType: 'task-status',
      status: task.status,
    });
    return { ok: true, task };
  }

  function snapshot(channelId = 'command-center') {
    ensure();
    return {
      ok: true,
      channels: readChannels(),
      activeChannelId: channelId,
      messages: readMessages(channelId, 120),
      tasks: readTasks().slice(-50),
    };
  }

  return { ensure, readChannels, readMessages, appendMessage, readTasks, upsertTask, snapshot };
}

module.exports = { createCommsStore, DEFAULT_CHANNELS };
