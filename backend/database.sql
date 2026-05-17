-- =============================================
--  VIBELY DATABASE SCHEMA
--  Run this file in MySQL to set up the database
-- =============================================

CREATE DATABASE IF NOT EXISTS vibely_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vibely_db;

-- --------------------------
-- USERS TABLE
-- --------------------------
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(30)  NOT NULL UNIQUE,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  full_name   VARCHAR(100) DEFAULT '',
  bio         TEXT         DEFAULT '',
  avatar      VARCHAR(255) DEFAULT 'default-avatar.png',
  website     VARCHAR(255) DEFAULT '',
  is_verified TINYINT(1)   DEFAULT 0,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email    (email)
);

-- --------------------------
-- POSTS TABLE
-- --------------------------
CREATE TABLE IF NOT EXISTS posts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  caption    TEXT         DEFAULT '',
  image_url  VARCHAR(255) DEFAULT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id   (user_id),
  INDEX idx_created_at (created_at)
);

-- --------------------------
-- COMMENTS TABLE
-- --------------------------
CREATE TABLE IF NOT EXISTS comments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  post_id    INT  NOT NULL,
  user_id    INT  NOT NULL,
  content    TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id)    ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)    ON DELETE CASCADE,
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id)
);

-- --------------------------
-- LIKES TABLE
-- --------------------------
CREATE TABLE IF NOT EXISTS likes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  post_id    INT NOT NULL,
  user_id    INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id)
);

-- --------------------------
-- FOLLOWERS TABLE
-- --------------------------
CREATE TABLE IF NOT EXISTS followers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  follower_id INT NOT NULL,
  following_id INT NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_follow (follower_id, following_id),
  FOREIGN KEY (follower_id)  REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_follower_id  (follower_id),
  INDEX idx_following_id (following_id)
);

-- --------------------------
-- NOTIFICATIONS TABLE
-- --------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT         NOT NULL,
  actor_id   INT         NOT NULL,
  type       ENUM('like','comment','follow','mention') NOT NULL,
  post_id    INT         DEFAULT NULL,
  is_read    TINYINT(1)  DEFAULT 0,
  created_at DATETIME    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id)  REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- =============================================
--  SAMPLE DATA (Optional - for testing)
-- =============================================
-- You can uncomment this block to seed test data
/*
INSERT INTO users (username, email, password, full_name, bio) VALUES
('vibely_admin', 'admin@vibely.com', '$2a$10$examplehash', 'Vibely Admin', 'Welcome to Vibely!');
*/
