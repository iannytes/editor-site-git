const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_IGNORES = new Set(['node_modules', '.git', 'dist', '.water-gym', '.water-gym-smoke']);

function normalizePath(value) {
  if (!value || typeof value !== 'string') return null;
  return path.resolve(value);
}

function isPathInside(parentPath, childPath) {
  const parent = normalizePath(parentPath);
  const child = normalizePath(childPath);
  if (!parent || !child) return false;
  const relative = path.relative(parent, child);
  return relative === '' || (!!relative && !relative.startsWith('..') && !path.isAbsolute(relative));
}

function isPathAllowed(targetPath, allowedFolders = [], workspaceRoot = null) {
  const normalized = normalizePath(targetPath);
  if (!normalized) return false;
  if (workspaceRoot && isPathInside(workspaceRoot, normalized)) return true;
  return (allowedFolders || []).some((folder) => folder?.path && isPathInside(folder.path, normalized));
}

function scanFolderInventory(folderPath, options = {}) {
  const root = normalizePath(folderPath);
  const maxFiles = Number(options.maxFiles) || 400;
  const maxDepth = Number(options.maxDepth) || 4;
  const files = [];
  const folders = [];
  const extensions = new Map();
  let skipped = 0;

  if (!root || !fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    return { ok: false, error: `Not a folder: ${root || '(none)'}` };
  }

  function walk(current, depth) {
    if (files.length >= maxFiles || depth > maxDepth) return;
    let entries = [];
    try { entries = fs.readdirSync(current, { withFileTypes: true }); } catch { skipped += 1; return; }
    for (const entry of entries) {
      if (files.length >= maxFiles) break;
      if (DEFAULT_IGNORES.has(entry.name)) { skipped += 1; continue; }
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        folders.push(fullPath);
        walk(fullPath, depth + 1);
      } else if (entry.isFile()) {
        let size = 0;
        try { size = fs.statSync(fullPath).size; } catch {}
        const ext = path.extname(entry.name).toLowerCase() || '(none)';
        extensions.set(ext, (extensions.get(ext) || 0) + 1);
        files.push({ path: fullPath, name: entry.name, size, ext });
      }
    }
  }

  walk(root, 0);
  return {
    ok: true,
    root,
    fileCount: files.length,
    folderCount: folders.length,
    skipped,
    truncated: files.length >= maxFiles,
    extensions: [...extensions.entries()].sort((a, b) => b[1] - a[1]).map(([ext, count]) => ({ ext, count })),
    sampleFiles: files.slice(0, 30),
  };
}

module.exports = { normalizePath, isPathInside, isPathAllowed, scanFolderInventory };
