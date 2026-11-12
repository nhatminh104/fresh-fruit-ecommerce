// Pass 2: sửa các ảnh còn nghi vấn sau audit title.
// Chạy: node scripts/fix-fruit-images-2.mjs [--apply]
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const here = path.dirname(fileURLToPath(import.meta.url));
const apply = process.argv.includes('--apply');
const OUT = path.join(here, '../seeds/data/product-images.json');

const BLOCK = /people|person|man\b|woman|child|kid|boy|girl|portrait|selfie|insect|scale|origami|stool|paint|tree|flower|blondie|sticky|tart|pizza|whipped|cream|juice|smoothie|cake|bread|bun|salad|bowl|platter|market|shop|store|stall|stand|sign|logo|packag|crisps|bar\b|bars\b|rat|claw|injur|leaf|spot|disease|seller|vendor|waffle|bacon|grant|pest|bug|scone|jam\b|buttermilk|rice\b|dog|osage|vegetable|prickly|cactus|seed|piper|pepper|nigrum|doctor|character|mascot|jelly|chocolate|candy|nuts?\b|tinn?ed|canned|\bcan\b|for you|#|\bhoa\b|cây|\bline\b/i;

const CONFIG = {
  'le-han-quoc': { q: 'pear', allow: /pear/i },
  'cat:dac-san-vung-mien': { q: 'vietnamese fruits', allow: /fruit|mango|durian|longan|lychee|pomelo|dragon/i },
  'cat:trai-cay-theo-mua': { q: 'seasonal fruits', allow: /fruit/i }
};

const scoreResult = (r) => {
  const w = r.width || 0, h = r.height || 0;
  const ratio = w && h ? Math.max(w / h, h / w) : 2;
  return (w >= 800 && w <= 2400 ? 2 : w >= 500 ? 1 : 0) + (ratio <= 1.3 ? 2 : ratio <= 1.8 ? 1 : 0) + (/wikimedia|staticflickr|unsplash/i.test(r.url || '') ? 1 : 0);
};

async function search(q) {
  const res = await fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=20`, {
    headers: { 'User-Agent': 'fresh-fruit-demo/1.0' }
  });
  if (!res.ok) throw new Error(`Openverse ${res.status}`);
  return (await res.json()).results || [];
}

async function verify(url) {
  try {
    const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
    return r.ok;
  } catch {
    return false;
  }
}

async function main() {
  const mapping = JSON.parse(await fs.readFile(OUT, 'utf8'));
  const used = new Set(Object.values(mapping).flatMap((v) => v.urls || [v.url]));
  const failed = [];
  for (const [slug, cfg] of Object.entries(CONFIG)) {
    let results;
    try {
      results = await search(cfg.q);
    } catch (e) {
      failed.push(`${slug}: search ${e.message}`);
      continue;
    }
    const candidates = results
      .filter((r) => r.url && r.thumbnail && /^https?:\/\//.test(r.url))
      .filter((r) => !used.has(r.thumbnail))
      .filter((r) => cfg.allow.test(r.title || ''))
      .filter((r) => !BLOCK.test(r.title || ''))
      .map((r) => ({ r, score: scoreResult(r) }))
      .sort((a, b) => b.score - a.score);

    const urls = [];
    for (const { r } of candidates) {
      if (urls.length >= 2) break;
      if (await verify(r.thumbnail)) urls.push(r.thumbnail);
      used.add(r.thumbnail);
    }
    if (!urls.length) {
      failed.push(`${slug}: no valid fruit image for "${cfg.q}"`);
      continue;
    }
    mapping[slug] = { url: urls[0], urls, title: (candidates[0]?.r.title || '').slice(0, 80), query: cfg.q };
    console.log(`${slug} -> ${(candidates[0]?.r.title || '').slice(0, 55)} | ${urls.length} imgs`);
    await new Promise((r) => setTimeout(r, 250));
  }

  await fs.writeFile(OUT, JSON.stringify(mapping, null, 2));
  console.log(`\nTotal ${Object.keys(mapping).length} mappings`);
  if (failed.length) console.log('FAILED:', failed);

  if (apply) {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fresh-fruit';
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    let updated = 0;
    for (const [slug, v] of Object.entries(mapping)) {
      if (slug.startsWith('cat:')) {
        await db.collection('categories').updateOne({ slug: slug.slice(4) }, { $set: { image: v.url } });
      } else {
        await db.collection('products').updateOne({ slug }, { $set: { images: v.urls || [v.url] } });
      }
      updated++;
    }
    console.log(`Applied ${updated} updates`);
    await mongoose.disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
