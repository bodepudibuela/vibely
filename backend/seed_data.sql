-- =============================================
--  VIBELY — SEED DATA
--  Run this AFTER database.sql to populate
--  your database with sample users & content.
--
--  All passwords are: Password123
--  (bcrypt hash of "Password123" with salt 10)
-- =============================================

USE vibely_db;

-- ─── USERS ───────────────────────────────────────────────────────────────────
-- Password for ALL accounts: Password123
INSERT INTO users (username, email, password, full_name, bio, avatar, website) VALUES
('priya_sharma',  'priya@vibely.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lkm6', 'Priya Sharma',   '📸 Photographer & traveller | Hyderabad 🌿',          'default-avatar.png', 'https://priyasharma.in'),
('rahul_dev',     'rahul@vibely.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lkm6', 'Rahul Dev',      '💻 Full-stack dev | Building cool stuff | ☕ Coffee addict', 'default-avatar.png', 'https://rahuldev.io'),
('ananya_art',    'ananya@vibely.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lkm6', 'Ananya Reddy',   '🎨 Digital artist | Illustrator | Sharing my world one doodle at a time', 'default-avatar.png', ''),
('kiran_fitness', 'kiran@vibely.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lkm6', 'Kiran Kumar',    '💪 Fitness coach | Nutrition | Morning runs 🏃',     'default-avatar.png', ''),
('meera_foodie',  'meera@vibely.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lkm6', 'Meera Pillai',   '🍜 Food blogger | Andhra recipes | Always hungry 😄', 'default-avatar.png', 'https://meerafoodstories.com'),
('aditya_vlogs',  'aditya@vibely.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lkm6', 'Aditya Nair',    '🎬 Content creator | Travel | Tech | Vlogger',       'default-avatar.png', ''),
('sneha_books',   'sneha@vibely.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lkm6', 'Sneha Menon',    '📚 Bookworm | Reviews & recommendations | Tea lover ☕', 'default-avatar.png', ''),
('vikram_music',  'vikram@vibely.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lkm6', 'Vikram Soni',    '🎸 Guitarist | Music producer | Carnatic + Rock fusion', 'default-avatar.png', ''),
('divya_nature',  'divya@vibely.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lkm6', 'Divya Krishnan', '🌿 Nature lover | Amateur botanist | Plant mom 🪴',  'default-avatar.png', ''),
('arjun_sports',  'arjun@vibely.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lkm6', 'Arjun Mehta',    '⚽ Football fanatic | Weekend cricketer | Sports analyst', 'default-avatar.png', '');

-- ─── POSTS ───────────────────────────────────────────────────────────────────
-- Note: image_url is NULL so posts still appear (caption-only posts are valid)
INSERT INTO posts (user_id, caption, image_url, created_at) VALUES
-- Priya (user 1) — 3 posts
(1, '✨ Golden hour in Charminar today. There is something magical about old architecture in warm light. What is your favourite historical place in India? 🕌 #Photography #Hyderabad #GoldenHour', NULL, NOW() - INTERVAL 5 DAY),
(1, 'Weekend trip to Araku Valley 🏔️ The coffee there is absolutely unreal. If you haven''t been, add it to your list immediately! #Travel #ArrakuValley #VisitAndhra', NULL, NOW() - INTERVAL 2 DAY),
(1, 'Film photography is making a comeback and I am HERE for it 📷 Shot this on my old Canon AE-1. Nothing beats the grain. #FilmPhotography #Analog', NULL, NOW() - INTERVAL 1 DAY),

-- Rahul (user 2) — 3 posts
(2, 'Just shipped my first open-source project! 🚀 A React component library for building dashboards faster. Drop a ⭐ if you want the GitHub link! #OpenSource #ReactJS #WebDev', NULL, NOW() - INTERVAL 6 DAY),
(2, 'Hot take: TypeScript is not optional anymore. If your team is still debating it in 2025, the debate is over. 😄 #TypeScript #Programming #WebDevelopment', NULL, NOW() - INTERVAL 3 DAY),
(2, 'Coffee ☕ + lo-fi music + a bug that only appears in production. Living the dev life. Anyone else debugging on a Saturday? 😅 #DeveloperLife #Coding', NULL, NOW() - INTERVAL 12 HOUR),

-- Ananya (user 3) — 2 posts
(3, 'Spent the whole evening on this digital portrait. The hair took forever but I think it was worth it ✨ Tools: Procreate + Apple Pencil. #DigitalArt #Illustration #ArtOfInstagram', NULL, NOW() - INTERVAL 4 DAY),
(3, 'Art tip: stop waiting for inspiration. Just start sketching. Inspiration shows up when you are already working 🎨 What is your creative process like? #ArtTips #CreativeLife', NULL, NOW() - INTERVAL 1 DAY),

-- Kiran (user 4) — 2 posts
(4, 'Morning routine that changed my life 🌅\n1️⃣ Wake up at 5:30 AM\n2️⃣ 10 mins meditation\n3️⃣ 45 min run\n4️⃣ Cold shower\n5️⃣ Protein breakfast\nTry it for 21 days and thank me later 💪 #Fitness #MorningRoutine', NULL, NOW() - INTERVAL 7 DAY),
(4, 'Reminder: rest days are not lazy days. Muscle is built during recovery, not during the workout. Sleep 8 hours, eat well, repeat 🔁 #FitnessTips #Recovery #Gym', NULL, NOW() - INTERVAL 2 DAY),

-- Meera (user 5) — 3 posts
(5, 'Made my grandmother''s pesarattu recipe today and cried a little 🥺 Some food is just memory in a bite. Sharing the recipe in comments! #AndhraFood #Pesarattu #HomeCooking', NULL, NOW() - INTERVAL 8 DAY),
(5, 'Biryani ranking in Hyderabad (personal, don''t @ me 😄):\n1. Paradise\n2. Bawarchi\n3. Shah Ghouse\n4. Café Bahar\n5. Sarvi\nFight me in the comments 👇 #HyderabadiFood #Biryani', NULL, NOW() - INTERVAL 4 DAY),
(5, 'Street food walk in Vijayawada today 🎉 The punugulu at the corner stall near Prakasam Barrage hit different at 7 PM. Some spots just never disappoint! #VijayawadaFood #StreetFood', NULL, NOW() - INTERVAL 6 HOUR),

-- Aditya (user 6) — 2 posts
(6, 'Just back from a solo trip to Spiti Valley 🏔️ No WiFi, no worries. Sometimes going offline is the most productive thing you can do. Vlog dropping soon! #SpitiValley #SoloTravel #Himalaya', NULL, NOW() - INTERVAL 5 DAY),
(6, 'Camera gear I actually use (not sponsored, just honest):\n📷 Sony A7 IV — primary\n🎥 GoPro Hero 12 — action\n📱 iPhone 15 Pro — quick shots\nYou don''t need the best gear, you need to go out and shoot! #Photography #ContentCreator', NULL, NOW() - INTERVAL 3 DAY),

-- Sneha (user 7) — 2 posts
(7, 'Finished "The Midnight Library" by Matt Haig last night 📚 I was not okay. It made me think about every path not taken. 10/10, clear your schedule before starting. #BookReview #Reading #MidnightLibrary', NULL, NOW() - INTERVAL 9 DAY),
(7, 'Currently reading: "Atomic Habits" for the third time. Every re-read hits differently. What book do you keep coming back to? 📖 #AtomicHabits #BookRecommendations', NULL, NOW() - INTERVAL 2 DAY),

-- Vikram (user 8) — 2 posts
(8, 'Just recorded a fusion piece — Carnatic raaga Bhairavi over a blues progression. It should not work this well but it absolutely does 🎸🪘 Will post a clip soon! #Music #IndianMusic #FusionMusic', NULL, NOW() - INTERVAL 6 DAY),
(8, 'Practice log — Day 127 🎸 Played for 2 hours today. Some days the fingers don''t cooperate but you show up anyway. That is what consistency looks like. #Guitar #MusicPractice', NULL, NOW() - INTERVAL 1 DAY),

-- Divya (user 9) — 2 posts
(9, 'Propagated 12 new plants this month 🌱 Free plants from cuttings — that is the best kind of math. Currently obsessed with pothos and monstera. Anyone else a plant parent here? 🪴 #PlantMom #IndoorPlants #PlantCare', NULL, NOW() - INTERVAL 10 DAY),
(9, 'Morning walk at Indira Gandhi Zoological Park, Vizag 🌿 The biodiversity here is incredible. We need to protect these green spaces. Nature heals. 🐦 #Nature #Vizag #Environment', NULL, NOW() - INTERVAL 3 DAY),

-- Arjun (user 10) — 2 posts
(10, 'WHAT A MATCH! India vs Australia last night 🏏 Kohli''s innings was pure poetry. That cover drive in the 40th over — cinema! #Cricket #IndvAus #Kohli', NULL, NOW() - INTERVAL 1 DAY),
(10, 'Sunday football with the boys ⚽ Lost 3-2 but honestly played the best football we have in months. Results matter but so does the process. #Football #SundayVibes #Sports', NULL, NOW() - INTERVAL 4 DAY);

-- ─── FOLLOWS ──────────────────────────────────────────────────────────────────
INSERT INTO followers (follower_id, following_id) VALUES
-- Priya follows
(1, 2), (1, 3), (1, 5), (1, 6), (1, 9),
-- Rahul follows
(2, 1), (2, 4), (2, 6), (2, 7), (2, 10),
-- Ananya follows
(3, 1), (3, 5), (3, 7), (3, 8),
-- Kiran follows
(4, 2), (4, 6), (4, 10),
-- Meera follows
(5, 1), (5, 3), (5, 9),
-- Aditya follows
(6, 1), (6, 2), (6, 8), (6, 9),
-- Sneha follows
(7, 3), (7, 5), (7, 8),
-- Vikram follows
(8, 2), (8, 6), (8, 7),
-- Divya follows
(9, 1), (9, 3), (9, 5), (9, 7),
-- Arjun follows
(10, 2), (10, 4), (10, 6);

-- ─── LIKES ───────────────────────────────────────────────────────────────────
INSERT INTO likes (post_id, user_id) VALUES
-- Post 1 (Priya - Charminar)
(1, 2), (1, 3), (1, 5), (1, 6), (1, 9),
-- Post 2 (Priya - Araku)
(2, 5), (2, 6), (2, 9),
-- Post 3 (Priya - Film photo)
(3, 3), (3, 6),
-- Post 4 (Rahul - open source)
(4, 1), (4, 5), (4, 7), (4, 10),
-- Post 5 (Rahul - TypeScript hot take)
(5, 2), (5, 6), (5, 10),
-- Post 6 (Rahul - debugging Saturday)
(6, 4), (6, 7),
-- Post 7 (Ananya - digital portrait)
(7, 1), (7, 2), (7, 5), (7, 8),
-- Post 8 (Ananya - art tip)
(8, 3), (8, 5), (8, 9),
-- Post 9 (Kiran - morning routine)
(9, 2), (9, 6), (9, 10),
-- Post 10 (Kiran - rest days)
(10, 1), (10, 4), (10, 7),
-- Post 11 (Meera - pesarattu)
(11, 1), (11, 3), (11, 5), (11, 7), (11, 9),
-- Post 12 (Meera - biryani ranking)
(12, 1), (12, 2), (12, 6), (12, 8), (12, 10),
-- Post 13 (Meera - Vijayawada street food)
(13, 1), (13, 9),
-- Post 14 (Aditya - Spiti Valley)
(14, 1), (14, 2), (14, 9),
-- Post 15 (Aditya - camera gear)
(15, 3), (15, 7),
-- Post 16 (Sneha - Midnight Library)
(16, 3), (16, 5), (16, 7),
-- Post 17 (Sneha - Atomic Habits)
(17, 2), (17, 4), (17, 6), (17, 9),
-- Post 18 (Vikram - fusion piece)
(18, 1), (18, 3), (18, 6),
-- Post 19 (Vikram - practice log)
(19, 5), (19, 8),
-- Post 20 (Divya - plant propagation)
(20, 1), (20, 3), (20, 5), (20, 7),
-- Post 21 (Divya - nature walk)
(21, 1), (21, 9),
-- Post 22 (Arjun - cricket match)
(22, 2), (22, 4), (22, 6), (22, 10),
-- Post 23 (Arjun - Sunday football)
(23, 4), (23, 6);

-- ─── COMMENTS ─────────────────────────────────────────────────────────────────
INSERT INTO comments (post_id, user_id, content) VALUES
-- Post 1 (Priya - Charminar)
(1, 2, 'Stunning shot! Charminar at golden hour is on my bucket list 🔥'),
(1, 5, 'This makes me want to plan a Hyderabad trip right now!'),
(1, 9, 'The warm tones are absolutely beautiful 🌅'),
-- Post 4 (Rahul - open source)
(4, 1, 'Congratulations!! Would love to see the repo 🚀'),
(4, 7, 'Amazing work! Open source contributions are so valuable'),
(4, 10, 'Send the link! Sounds super useful for my next project'),
-- Post 5 (Rahul - TypeScript)
(5, 10, 'Fully agree. Once you go TypeScript you never go back 😄'),
(5, 6, 'Took our team 2 weeks to migrate and it was 100% worth it'),
-- Post 7 (Ananya - digital portrait)
(7, 1, 'This is breathtaking! The lighting is so realistic ✨'),
(7, 2, 'Incredible. How long does a piece like this take you?'),
(7, 5, 'The details in the hair 😍 So much patience!'),
-- Post 9 (Kiran - morning routine)
(9, 2, 'I tried this for a week and wow, the cold shower actually works!'),
(9, 6, 'Day 3 complete! The 5:30 wake up is tough but worth it'),
-- Post 11 (Meera - pesarattu)
(11, 1, 'Please share the recipe!! Pesarattu is my favourite breakfast 🙏'),
(11, 3, 'This post made me call my mom and ask for her recipe too 🥺'),
(11, 9, 'Food that carries memories is the best kind of food 💙'),
-- Post 12 (Meera - biryani ranking)
(12, 1, 'Shah Ghouse at #3?? I need to have a word with you 😄'),
(12, 8, 'Bawarchi deserves top spot honestly. Unpopular opinion maybe?'),
(12, 6, 'Where is Café Niloufer on this list? Asking for a friend 😅'),
-- Post 13 (Meera - Vijayawada)
(13, 1, 'Vijayawada street food is on another level! Miss it so much 💙'),
-- Post 16 (Sneha - Midnight Library)
(16, 5, 'I ugly cried at 2 AM reading this. Masterpiece.'),
(16, 9, 'Adding to my list right now. Need tissues ready?'),
-- Post 20 (Divya - plants)
(20, 1, 'Plant parent gang! 🙌 Pothos are the most forgiving plants'),
(20, 5, 'Free plants from cuttings is peak adulting honestly 🌱'),
-- Post 22 (Arjun - cricket)
(22, 2, 'That cover drive!! Instantly saved the clip 🏏'),
(22, 4, 'India is looking unstoppable this season');

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
-- Generate follow notifications for users
INSERT INTO notifications (user_id, actor_id, type, post_id, is_read) VALUES
(1, 2, 'follow', NULL, 0),
(1, 3, 'follow', NULL, 0),
(1, 5, 'follow', NULL, 0),
(2, 1, 'follow', NULL, 1),
(3, 1, 'follow', NULL, 1),
-- Like notifications
(1, 5, 'like', 1, 0),
(1, 6, 'like', 2, 0),
(2, 1, 'like', 4, 1),
(3, 1, 'like', 7, 0),
(5, 1, 'like', 11, 0),
-- Comment notifications
(1, 2, 'comment', 1, 0),
(2, 1, 'comment', 4, 1),
(3, 1, 'comment', 7, 0),
(5, 1, 'comment', 11, 0);

-- ─── VERIFY ───────────────────────────────────────────────────────────────────
SELECT 'Users'         AS table_name, COUNT(*) AS rows FROM users
UNION ALL
SELECT 'Posts',         COUNT(*) FROM posts
UNION ALL
SELECT 'Followers',     COUNT(*) FROM followers
UNION ALL
SELECT 'Likes',         COUNT(*) FROM likes
UNION ALL
SELECT 'Comments',      COUNT(*) FROM comments
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications;
