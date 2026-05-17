// =============================================
//  VIBELY — Image Seeder Script
//  Downloads free images from picsum.photos
//  and updates posts with real image files.
//
//  HOW TO RUN:
//  1. Place this file in your backend folder
//  2. Run: node seed_images.js
// =============================================

require('dotenv').config();
const https    = require('https');
const http     = require('http');
const fs       = require('fs');
const path     = require('path');
const mysql    = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

// ─── Config ──────────────────────────────────────────────────────────────────
const DB = {
  host:     'localhost',
  user:     'root',
  password: 'root123',
  database: 'vibely_db',
};

const POSTS_DIR = path.join(__dirname, 'uploads', 'posts');

// ─── Image assignments per post (picsum photo IDs — all free, no attribution needed) ──
// Each entry: [postId, picsumId, width, height]
const POST_IMAGES = [
  // Priya — photography, travel
  [1,  417,  800, 800],   // architecture / golden light
  [2,  167,  800, 800],   // valley / mountains
  [3,  96,   800, 800],   // film / vintage camera feel

  // Rahul — dev, tech
  [4,  0,    800, 800],   // abstract / tech
  [5,  180,  800, 800],   // minimal dark
  [6,  1068, 800, 800],   // coffee / desk

  // Ananya — art, illustration
  [7,  219,  800, 800],   // colourful abstract
  [8,  247,  800, 800],   // creative / paint

  // Kiran — fitness
  [9,  145,  800, 800],   // sunrise / outdoor
  [10, 399,  800, 800],   // gym / weights

  // Meera — food
  [11, 292,  800, 800],   // food / meal
  [12, 493,  800, 800],   // food spread
  [13, 431,  800, 800],   // street food

  // Aditya — travel, vlogs
  [14, 236,  800, 800],   // mountains / snow
  [15, 318,  800, 800],   // camera gear

  // Sneha — books
  [16, 24,   800, 800],   // books / library
  [17, 256,  800, 800],   // reading / cosy

  // Vikram — music
  [18, 65,   800, 800],   // guitar / music
  [19, 381,  800, 800],   // stage / instruments

  // Divya — nature, plants
  [20, 139,  800, 800],   // plants / green
  [21, 82,   800, 800],   // nature / forest

  // Arjun — sports
  [22, 159,  800, 800],   // cricket / sports
  [23, 28,   800, 800],   // football / field
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file  = fs.createWriteStream(dest);

    const request = proto.get(url, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });

    request.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });

    file.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌱  Vibely Image Seeder\n');

  // Ensure uploads/posts folder exists
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
    console.log('📁  Created uploads/posts directory');
  }

  // Connect to DB
  const pool = await mysql.createPool(DB);
  console.log('✅  Connected to MySQL\n');

  let success = 0;
  let failed  = 0;

  for (const [postId, picsumId, w, h] of POST_IMAGES) {
    const filename = `${uuidv4()}.jpg`;
    const dest     = path.join(POSTS_DIR, filename);
    const url      = `https://picsum.photos/id/${picsumId}/${w}/${h}`;

    process.stdout.write(`  Post ${String(postId).padStart(2, '0')} → downloading image ${picsumId}... `);

    try {
      await downloadFile(url, dest);
      await pool.query('UPDATE posts SET image_url = ? WHERE id = ?', [filename, postId]);
      console.log(`✅  ${filename}`);
      success++;
    } catch (err) {
      console.log(`❌  FAILED (${err.message})`);
      // Try fallback with a different picsum ID
      try {
        const fallbackId  = 10 + postId;
        const fallbackUrl = `https://picsum.photos/id/${fallbackId}/${w}/${h}`;
        await downloadFile(fallbackUrl, dest);
        await pool.query('UPDATE posts SET image_url = ? WHERE id = ?', [filename, postId]);
        console.log(`  ↳  Fallback ✅  ${filename}`);
        success++;
      } catch {
        failed++;
      }
    }

    // Small delay to be polite to the API
    await sleep(300);
  }

  await pool.end();

  console.log(`\n✨  Done! ${success} images downloaded, ${failed} failed.`);
  console.log('🔄  Refresh your Vibely — all posts now have images!\n');
}

main().catch(err => {
  console.error('❌  Script error:', err.message);
  process.exit(1);
});
