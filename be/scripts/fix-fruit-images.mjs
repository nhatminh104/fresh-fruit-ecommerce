// Re-curate ảnh sản phẩm: chỉ giữ ảnh đúng loại trái cây, URL phải load được không cần Referer.
// Ưu tiên: upload.wikimedia.org (hotlink OK) > Openverse thumbnail (proxy, luôn OK).
// Chạy: node scripts/fix-fruit-images.mjs [--apply]
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const here = path.dirname(fileURLToPath(import.meta.url));
const apply = process.argv.includes('--apply');
const OUT = path.join(here, '../seeds/data/product-images.json');

// BLOCK: title chứa các từ này -> loại (người, vật, côn trùng, cây, hoa, đồ ăn chế biến, cảnh)
const BLOCK = /people|person|man\b|woman|child|kid|boy|girl|portrait|selfie|insect|scale|origami|stool|paint|tree|flower|blondie|sticky|tart|pizza|whipped|cream|juice|smoothie|cake|bread|bun|scone|jam\b|buttermilk|rice\b|dog|waffle|bacon|grant|pest|bug|seller|vendor|market|shop|store|stall|stand|sign|logo|packag|crisps|bar\b|bars\b|rat|claw|injur|leaf|spot|disease|osage|vegetable|#|\bhoa\b|cây|salad|bowl|platter/i;

// display URL: luôn dùng thumbnail proxy của Openverse — hotlink được, không bị rate-limit như upload.wikimedia.org
const displayUrl = (r) => r.thumbnail || r.url;

const CONFIG = {
  'xoai-cat-chu': { q: 'mango fruit', allow: /mango/i },
  'sau-rieng-ri6': { q: 'durian fruit', allow: /durian/i },
  'dau-tay-da-lat': { q: 'strawberries', allow: /strawberr/i },
  'le-han-quoc': { q: 'pear fruit', allow: /pear/i },
  'nho-uc': { q: 'green grapes', allow: /grape/i },
  'combo-gia-dinh': { q: 'fresh fruits', allow: /fruit/i },
  'buoi-da-xanh': { q: 'pomelo', allow: /pomelo|pummelo|shaddock/i },
  'thanh-long-ruot-do': { q: 'dragon fruit', allow: /dragon/i },
  'cam-sanh': { q: 'orange fruit', allow: /orange|mandarin/i },
  'tao-envy': { q: 'red apple', allow: /apple/i },
  'combo-detox': { q: 'fresh fruit', allow: /fruit/i },
  'chuoi-sur': { q: 'bananas', allow: /banana|plantain/i },
  'dua-thom': { q: 'pineapple', allow: /pineapple|ananas/i },
  'mang-cut': { q: 'mangosteen', allow: /mango(st)?een|garcinia/i },
  'dua-hau': { q: 'watermelon', allow: /watermelon|melon/i },
  'thanh-long-trang': { q: 'pitaya', allow: /dragon|pitaya/i },
  'buoi-nam-roi': { q: 'pomelo fruit', allow: /pomelo|pummelo|shaddock/i },
  'quyt-duong': { q: 'mandarin orange', allow: /mandarin|tangerine|orange/i },
  'cam-mat-ong': { q: 'orange', allow: /orange|mandarin/i },
  'viet-quat': { q: 'blueberries', allow: /blueberr/i },
  'mam-xoi': { q: 'raspberries', allow: /raspberr/i },
  'xoai-hoa-loc': { q: 'mango', allow: /mango/i },
  'vai-thieu': { q: 'lychee', allow: /lychee|litchi/i },
  'nhan-tieu': { q: 'longan fruit', allow: /longan/i },
  'oi-dai-loan': { q: 'guava', allow: /guava/i },
  'xoai-uc': { q: 'mango', allow: /mango/i },
  'dau-tay-nhat': { q: 'strawberry', allow: /strawberr/i },
  'chuoi-say-gion': { q: 'banana chips', allow: /chip|crispy banana|dried banana/i },
  'xoai-say': { q: 'dried mango', allow: /mango/i },
  'nho-kho': { q: 'raisins', allow: /raisin/i },
  'combo-mua-he': { q: 'summer fruit', allow: /fruit/i },
  'combo-van-phong': { q: 'fresh fruit', allow: /fruit/i },
  'cat:trai-cay-viet-nam': { q: 'tropical fruit', allow: /fruit|mango|banana|pineapple|papaya|guava/i },
  'cat:trai-cay-nhap-khau': { q: 'exotic fruit', allow: /fruit|apple|pear|grape|orange|kiwi/i },
  'cat:combo-trai-cay': { q: 'fruit basket', allow: /fruit|basket/i },
  'cat:trai-cay-nhiet-doi': { q: 'tropical fruits', allow: /fruit|mango|banana|pineapple|papaya|guava|dragon/i },
  'cat:trai-cay-co-mui': { q: 'citrus fruits', allow: /citrus|orange|lemon|lime|pomelo|grapefruit|mandarin/i },
  'cat:ho-cam-quyt': { q: 'oranges', allow: /orange|mandarin|citrus/i },
  'cat:trai-cay-mong': { q: 'mixed berries', allow: /berr|strawberr|blueberr|raspberr|blackberr/i },
  'cat:dac-san-vung-mien': { q: 'vietnamese fruit', allow: /fruit|mango|durian|longan|lychee|pomelo|dragon/i },
  'cat:trai-cay-say': { q: 'dried fruits', allow: /dried|raisin|mango|banana|fruit/i },
  'cat:trai-cay-theo-mua': { q: 'seasonal fruit', allow: /fruit/i }
};

const scoreResult = (r) => {
  const w = r.width || 0, h = r.height || 0;
  const ratio = w && h ? Math.max(w / h, h / w) : 2;
  return (w >= 800 && w <= 2400 ? 2 : w >= 500 ? 1 : 0) + (ratio <= 1.3 ? 2 : ratio <= 1.8 ? 1 : 0) + (/wikimedia/i.test(r.url || '') ? 1 : 0);
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
    const r = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-1023' }, signal: AbortSignal.timeout(10000) });
    return r.ok;
  } catch {
    return false;
  }
}

async function main() {
  const mapping = {};
  const failed = [];
  const used = new Set();
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
      .filter((r) => !used.has(displayUrl(r)))
      .filter((r) => cfg.allow.test(r.title || ''))
      .filter((r) => !BLOCK.test(r.title || ''))
      .map((r) => ({ r, score: scoreResult(r) }))
      .sort((a, b) => b.score - a.score);

    const urls = [];
    for (const { r } of candidates) {
      if (urls.length >= 2) break;
      const du = displayUrl(r);
      if (await verify(du)) urls.push(du);
      used.add(du);
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
  console.log(`\nSaved ${Object.keys(mapping).length}/42 mappings`);
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
