import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

async function filesIn(directory) { const entries = await readdir(directory, { withFileTypes: true }); const files = []; for (const entry of entries) { const path = join(directory, entry.name); if (entry.isDirectory()) files.push(...await filesIn(path)); else if (entry.name.endsWith('.js')) files.push(path); } return files; }
const files = await filesIn(fileURLToPath(new URL('../src/', import.meta.url))); let failed = false; for (const file of files) { const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' }); if (result.status !== 0) { failed = true; console.error(`Syntax check failed: ${relative(process.cwd(), file)}`); } } if (failed) process.exit(1); console.log(`Syntax check passed: ${files.length} files`);
