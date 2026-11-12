// Fetch ảnh sản phẩm theo từ khóa qua Openverse API (ảnh CC), verify HTTP 200,
// lưu mapping vào seeds/data/product-images.json và cập nhật MongoDB.
// Chạy: node scripts/update-product-images.mjs [--apply]
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const here = path.dirname(fileURLToPath(import.meta.url));
const apply = process.argv.includes('--apply');

const KEYWORDS = {
  'xoai-cat-chu': ['mango fruit', 0],
  'sau-rieng-ri6': ['durian fruit', 0],
  'dau-tay-da-lat': ['strawberry', 0],
  'le-han-quoc': ['asian pear fruit', 0],
  'nho-uc': ['green grapes', 0],
  'combo-gia-dinh': ['fresh fruit basket', 0],
  'buoi-da-xanh': ['pomelo fruit', 0],
  'thanh-long-ruot-do': ['dragon fruit', 0],
  'cam-sanh': ['orange fruit', 0],
  'tao-envy': ['red apple fruit', 0],
  'combo-detox': ['fruit salad bowl', 0],
  'chuoi-sur': ['banana fruit', 0],
  'dua-thom': ['pineapple fruit', 0],
  'mang-cut': ['mangosteen', 0],
  'dua-hau': ['watermelon fruit', 0],
  'thanh-long-trang': ['white dragon fruit', 0],
  'buoi-nam-roi': ['pomelo', 1],
  'quyt-duong': ['mandarin orange', 0],
  'cam-mat-ong': ['orange', 2],
  'viet-quat': ['blueberries', 0],
  'mam-xoi': ['raspberries', 0],
  'xoai-hoa-loc': ['mango', 3],
  'vai-thieu': ['lychee fruit', 0],
  'nhan-tieu': ['longan fruit', 0],
  'oi-dai-loan': ['guava fruit', 0],
  'xoai-uc': ['mango', 6],
  'dau-tay-nhat': ['strawberry', 4],
  'chuoi-say-gion': ['dried banana chips', 0],
  'xoai-say': ['dried mango', 0],
  'nho-kho': ['raisins', 0],
  'combo-mua-he': ['summer fruits', 0],
  'combo-van-phong': ['fresh fruit platter', 0],
  // danh mục
  'cat:trai-cay-viet-nam': ['vietnamese fruits market', 0],
  'cat:trai-cay-nhap-khau': ['fresh produce market', 0],
  'cat:combo-trai-cay': ['fruit basket', 1],
  'cat:trai-cay-nhiet-doi': ['tropical fruits', 0],
  'cat:trai-cay-co-mui': ['citrus fruits', 0],
  'cat:ho-cam-quyt': ['oranges', 0],
  'cat:trai-cay-mong': ['berries', 0],
  'cat:dac-san-vung-mien': ['vietnamese specialty fruits', 0],
  'cat:trai-cay-say': ['dried fruits', 0],
  'cat:trai-cay-theo-mua': ['seasonal fruits', 0]
};

async function searchOpenverse(query, pageSize = 10) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=${pageSize}&license_type=all`;
  const res = await fetch(url, { headers: { 'User-Agent': 'fresh-fruit-demo/1.0' } });
  if (!res.ok) throw new Error(`Openverse ${res.status}`);
  const data = await res.json();
  return data.results || [];
}

async function verifyImage(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
    if (res.ok) return true;
    const res2 = await fetch(url, { signal: AbortSignal.timeout(8000) });
    return res2.ok;
  } catch {
    return false;
  }
}

function scoreResult(r) {
  const w = r.width || 0, h = r.height || 0;
  const ratio = w && h ? Math.max(w / h, h / w) : 2;
  const sizeScore = w >= 800 && w <= 2400 ? 2 : w >= 500 ? 1 : 0;
  const ratioScore = ratio <= 1.3 ? 2 : ratio <= 1.8 ? 1 : 0;
  const stable = /wikimedia|staticflickr|images\.unsplash|live\.staticflickr/i.test(r.url) ? 1 : 0;
  return sizeScore + ratioScore + stable;
}

function pickCandidates(results, count = 3) {
  // Trả về tối đa `count` ảnh khác nhau, ưu tiên kích thước/tỷ lệ/source ổn định
  const usable = results.filter((r) => r.url && /^https?:\/\//.test(r.url));
  const scored = usable
    .map((r, i) => ({ r, score: scoreResult(r), idx: i }))
    .sort((a, b) => b.score - a.score || a.idx - b.idx);
  const picked = [];
  const seen = new Set();
  for (const { r } of scored) {
    if (seen.has(r.url)) continue;
    seen.add(r.url);
    picked.push(r);
    if (picked.length >= count) break;
  }
  return picked;
}

async function main() {
  const mapping = {};
  const failures = [];
  const globalSeen = new Set();
  for (const [slug, [query]] of Object.entries(KEYWORDS)) {
    try {
      const results = await searchOpenverse(query, 15);
      const picks = pickCandidates(results, 3).filter((r) => !globalSeen.has(r.url));
      if (!picks.length) { failures.push(`${slug}: no results`); continue; }
      const verified = [];
      for (const pick of picks) {
        if (await verifyImage(pick.url)) verified.push(pick);
        if (verified.length >= 2) break;
      }
      if (!verified.length) { failures.push(`${slug}: verify failed`); continue; }
      verified.forEach((p) => globalSeen.add(p.url));
      mapping[slug] = { url: verified[0].url, urls: verified.map((p) => p.url), title: (verified[0].title || '').slice(0, 80), query };
      console.log(`${slug} -> ${verified.length} imgs`);
    } catch (error) {
      failures.push(`${slug}: ${error.message}`);
      console.log(`${slug} -> ERROR ${error.message}`);
    }
    await new Promise((r) => setTimeout(r, 300)); // rate limit nhẹ
  }

  const outPath = path.join(here, '../seeds/data/product-images.json');
  await fs.writeFile(outPath, JSON.stringify(mapping, null, 2));
  console.log(`\nSaved ${Object.keys(mapping).length} mappings -> ${outPath}`);
  if (failures.length) console.log('Failures:', failures);

  if (apply) {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fresh-fruit';
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    let updated = 0;
    for (const [slug, { url }] of Object.entries(mapping)) {
      if (slug.startsWith('cat:')) {
        const catSlug = slug.slice(4);
        await db.collection('categories').updateOne({ slug: catSlug }, { $set: { image: url } });
      } else {
        await db.collection('products').updateOne({ slug }, { $set: { images: mapping[slug].urls || [url] } });
      }
      updated++;
    }
    console.log(`Applied ${updated} image updates to MongoDB`);
    await mongoose.disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
