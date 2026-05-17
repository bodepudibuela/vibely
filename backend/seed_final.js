// backend/seed_final.js
// Run with: node seed_final.js
// This script downloads real images and seeds the database with proper posts

const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const https  = require('https');
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'vibely_db',
});

// Download image from URL and save to file
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file  = fs.createWriteStream(filepath);
    proto.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(filepath);
        downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(filepath); });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

const users = [
  { username: 'meera_foodie',   email: 'meera@vibely.com',   full_name: 'Meera Pillai',    bio: 'Food blogger | Andhra recipes | Always hungry',   website: 'https://meerafoodstories.com' },
  { username: 'rahul_dev',      email: 'rahul@vibely.com',   full_name: 'Rahul Sharma',    bio: 'Full Stack Dev | Coffee addict | Building things', website: 'https://rahuldev.in' },
  { username: 'priya_sharma',   email: 'priya@vibely.com',   full_name: 'Priya Sharma',    bio: 'Travel & Photography | Exploring India 🇮🇳',       website: '' },
  { username: 'arjun_sports',   email: 'arjun@vibely.com',   full_name: 'Arjun Reddy',     bio: 'Cricket lover | Sports analyst | Hyderabad',      website: '' },
  { username: 'sneha_books',    email: 'sneha@vibely.com',   full_name: 'Sneha Gupta',     bio: 'Bookworm | Writer | Tea over coffee always',      website: '' },
  { username: 'vikram_music',   email: 'vikram@vibely.com',  full_name: 'Vikram Nair',     bio: 'Musician | Guitar | Lo-fi beats creator',         website: '' },
  { username: 'ananya_art',     email: 'ananya@vibely.com',  full_name: 'Ananya Singh',    bio: 'Artist | Illustrator | Sketching daily',          website: '' },
  { username: 'kiran_fitness',  email: 'kiran@vibely.com',   full_name: 'Kiran Kumar',     bio: 'Fitness coach | Nutrition | Mind & Body',         website: '' },
];

// picsum IDs guaranteed to be real and beautiful
const posts = [
  { user: 'meera_foodie',  caption: 'Homemade biryani for Sunday lunch 🍛 Nothing beats the aroma of whole spices and slow cooked rice. Recipe in my blog!', imgId: 292 },
  { user: 'meera_foodie',  caption: 'Street food walk in Vijayawada! The punugulu at the corner stall near Prakasam Barrage hit different today 🔥', imgId: 431 },
  { user: 'meera_foodie',  caption: 'Made my grandmother\'s pesarattu recipe today and cried a little. Some food is just pure nostalgia 💚', imgId: 1080 },
  { user: 'rahul_dev',     caption: 'Late night coding session ☕ Coffee + lo-fi music + a bug that only appears in production. Living the dev life.', imgId: 0 },
  { user: 'rahul_dev',     caption: 'Hot take: TypeScript is not optional anymore. If your team is still debating it in 2025, it\'s already too late 🔥', imgId: 3 },
  { user: 'priya_sharma',  caption: 'Weekend trip to Araku Valley ☕ The coffee there is absolutely unreal. If you have not been, add it to your list NOW.', imgId: 338 },
  { user: 'priya_sharma',  caption: 'Film photography is making a comeback and I am HERE for it. Shot this on my old Canon AE-1. Nothing like it 📷', imgId: 96 },
  { user: 'priya_sharma',  caption: 'Morning light in Vizag 🌅 Woke up at 5am for this shot and absolutely zero regrets.', imgId: 358 },
  { user: 'arjun_sports',  caption: 'WHAT A MATCH! India vs Australia last night. Kohli\'s innings was pure poetry. That cover drive in the 40th over 🏏🔥', imgId: 173 },
  { user: 'arjun_sports',  caption: 'Training session done ✅ 5km run + strength workout. Consistency is the only secret to fitness. No shortcuts!', imgId: 185 },
  { user: 'sneha_books',   caption: 'Currently reading Atomic Habits for the third time. Every re-read hits differently. Highly recommend 📚', imgId: 159 },
  { user: 'sneha_books',   caption: 'Rainy Sunday + hot tea + a good book = absolute perfection ☕📖 Currently on chapter 8 of The Midnight Library.', imgId: 160 },
  { user: 'vikram_music',  caption: 'New lo-fi track dropping this Friday 🎵 Been working on this one for 3 weeks. Can\'t wait for you all to hear it.', imgId: 183 },
  { user: 'vikram_music',  caption: 'Practice log Day 127. Played guitar for 2 hours today. Fingers don\'t cooperate but the sound is getting better 🎸', imgId: 224 },
  { user: 'ananya_art',    caption: 'Art tip: stop waiting for inspiration. Just start sketching. Inspiration shows up when you are already working ✏️', imgId: 266 },
  { user: 'ananya_art',    caption: 'Finished this portrait after 4 days of work 🎨 Charcoal on A3 paper. She asked me to capture her laugh and I hope I did.', imgId: 211 },
  { user: 'kiran_fitness', caption: 'Reminder: rest days are not lazy days. Muscle is built during recovery, not during the workout. Rest is training 💪', imgId: 209 },
  { user: 'kiran_fitness', caption: 'Morning yoga session done 🧘 30 minutes of stillness before the chaos of the day. Try it for just one week.', imgId: 231 },
];

const follows = [
  ['rahul_dev', 'meera_foodie'], ['priya_sharma', 'meera_foodie'],
  ['arjun_sports', 'meera_foodie'], ['sneha_books', 'meera_foodie'],
  ['meera_foodie', 'rahul_dev'], ['priya_sharma', 'rahul_dev'],
  ['vikram_music', 'rahul_dev'], ['meera_foodie', 'priya_sharma'],
  ['rahul_dev', 'priya_sharma'], ['arjun_sports', 'priya_sharma'],
  ['meera_foodie', 'arjun_sports'], ['vikram_music', 'ananya_art'],
  ['sneha_books', 'ananya_art'], ['kiran_fitness', 'arjun_sports'],
  ['ananya_art', 'vikram_music'], ['kiran_fitness', 'sneha_books'],
];

async function run() {
  console.log('🚀 Starting Vibely seed...\n');

  const conn = await pool.getConnection();

  // Clear existing data
  console.log('🗑️  Clearing old data...');
  await conn.query('SET FOREIGN_KEY_CHECKS=0');
  await conn.query('TRUNCATE TABLE notifications');
  await conn.query('TRUNCATE TABLE likes');
  await conn.query('TRUNCATE TABLE comments');
  await conn.query('TRUNCATE TABLE followers');
  await conn.query('TRUNCATE TABLE posts');
  await conn.query('TRUNCATE TABLE users');
  await conn.query('SET FOREIGN_KEY_CHECKS=1');

  // Create upload dirs
  const postsDir = path.join(__dirname, 'uploads/posts');
  const avatarsDir = path.join(__dirname, 'uploads/avatars');
  if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
  if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

  // Create users
  console.log('👤 Creating users...');
  const password = await bcrypt.hash('password123', 10);
  const userMap  = {};
  for (const u of users) {
    const [res] = await conn.query(
      'INSERT INTO users (username, email, password, full_name, bio, website) VALUES (?,?,?,?,?,?)',
      [u.username, u.email, password, u.full_name, u.bio, u.website]
    );
    userMap[u.username] = res.insertId;
    console.log(`  ✅ @${u.username}`);
  }

  // Download images and create posts
  console.log('\n📸 Downloading images and creating posts...');
  const postIds = [];
  for (const p of posts) {
    const filename = `post_${p.imgId}_${Date.now()}.jpg`;
    const filepath = path.join(postsDir, filename);
    const imgUrl   = `https://picsum.photos/id/${p.imgId}/800/600`;

    try {
      process.stdout.write(`  Downloading image ${p.imgId}...`);
      await downloadImage(imgUrl, filepath);
      console.log(' ✅');
    } catch (e) {
      console.log(' ❌ (skipping image)');
    }

    const userId   = userMap[p.user];
    const imgFile  = fs.existsSync(filepath) ? filename : null;
    const [res] = await conn.query(
      'INSERT INTO posts (user_id, caption, image_url) VALUES (?,?,?)',
      [userId, p.caption, imgFile]
    );
    postIds.push({ id: res.insertId, userId });
  }

  // Add follows
  console.log('\n👥 Setting up follows...');
  for (const [follower, following] of follows) {
    if (userMap[follower] && userMap[following]) {
      await conn.query(
        'INSERT IGNORE INTO followers (follower_id, following_id) VALUES (?,?)',
        [userMap[follower], userMap[following]]
      );
    }
  }

  // Add likes
  console.log('❤️  Adding likes...');
  for (let i = 0; i < postIds.length; i++) {
    const post    = postIds[i];
    const likers  = Object.values(userMap).filter(id => id !== post.userId).slice(0, 3 + (i % 4));
    for (const likerId of likers) {
      await conn.query('INSERT IGNORE INTO likes (post_id, user_id) VALUES (?,?)', [post.id, likerId]);
    }
  }

  // Add comments
  console.log('💬 Adding comments...');
  const commentTexts = [
    'This is amazing! 😍', 'Love this so much!', 'Wow, incredible!',
    'Goals 🔥', 'So beautiful!', 'This made my day 💯',
    'Absolutely stunning!', 'Can\'t stop looking at this 👀',
  ];
  for (let i = 0; i < postIds.length; i++) {
    const post      = postIds[i];
    const commenters = Object.values(userMap).filter(id => id !== post.userId).slice(0, 2);
    for (const commenter of commenters) {
      const text = commentTexts[(i + commenter) % commentTexts.length];
      await conn.query(
        'INSERT INTO comments (post_id, user_id, content) VALUES (?,?,?)',
        [post.id, commenter, text]
      );
    }
  }

  conn.release();
  await pool.end();

  console.log('\n✅ Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👤 ${users.length} users created`);
  console.log(`📸 ${posts.length} posts with images`);
  console.log(`👥 ${follows.length} follow relationships`);
  console.log('\n🔑 Login with any user:');
  console.log('   Email:    meera@vibely.com');
  console.log('   Password: password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

run().catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
