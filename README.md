# 🟠 Vibely — Mini Social Media Platform

A fully functional social media web app built with **HTML/CSS/JS + Express.js + MySQL**.

---

## ✨ Features

| Category        | Features |
|----------------|----------|
| **Auth**        | Register, Login, JWT authentication, bcrypt password hashing |
| **Profiles**    | Avatar upload, bio, website, follower/following counts |
| **Posts**       | Create (with image), edit caption, delete, image upload via Multer |
| **Feed**        | Home feed (followed users + own posts), explore all posts |
| **Comments**    | Add / delete comments on any post |
| **Likes**       | Like / unlike posts with live count |
| **Follow**      | Follow / unfollow any user |
| **Search**      | Search users by username or name |
| **Notifications** | In-app notifications for likes, comments, follows |
| **Dark Mode**   | Toggle stored in localStorage |
| **Real-time**   | Socket.io for live notification badges |
| **Infinite Scroll** | Feed auto-loads more posts on scroll |

---

## 🗂 Project Structure

```
vibely/
├── backend/
│   ├── config/
│   │   ├── db.js            # MySQL connection pool
│   │   └── multer.js        # File upload config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── commentController.js
│   │   └── likeController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT protect middleware
│   │   ├── error.js         # Global error handler
│   │   └── validate.js      # Input validation helpers
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── posts.js
│   │   ├── comments.js
│   │   └── likes.js
│   ├── uploads/
│   │   ├── posts/           # Post images stored here
│   │   └── avatars/         # Avatar images stored here
│   ├── database.sql         # Full MySQL schema
│   ├── server.js            # Express + Socket.io entry point
│   ├── package.json
│   └── .env.example         # Copy to .env and fill in values
│
└── frontend/
    ├── css/
    │   └── main.css         # Full design system
    ├── js/
    │   ├── api.js           # Centralised API fetch helper
    │   ├── layout.js        # Sidebar, topbar, create-post modal
    │   ├── posts.js         # Post card rendering, likes, comments
    │   └── socket.js        # Socket.io client + toast notifications
    ├── pages/
    │   ├── login.html
    │   ├── register.html
    │   ├── feed.html
    │   ├── explore.html
    │   ├── profile.html
    │   ├── notifications.html
    │   └── post.html
    └── index.html           # Landing page
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- **Node.js** v16 or higher
- **MySQL** 8.x running locally
- A terminal / command prompt

---

### 2. Database Setup

Open MySQL and run:

```sql
SOURCE /path/to/vibely/backend/database.sql;
```

Or paste the contents of `backend/database.sql` into MySQL Workbench / DBeaver / phpMyAdmin.

This creates the `vibely_db` database and all 6 tables:
`users`, `posts`, `comments`, `likes`, `followers`, `notifications`

---

### 3. Backend Setup

```bash
cd vibely/backend

# Install dependencies
npm install

# Copy env template and fill in your values
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=vibely_db
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
```

Start the server:

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

You should see:
```
✅  MySQL connected successfully
🚀  Vibely server running on http://localhost:5000
📡  Socket.io ready
```

---

### 4. Frontend Setup

No build step needed — it's plain HTML/CSS/JS.

Just open `frontend/index.html` in your browser, **or** use a simple static file server:

```bash
# Option A: VS Code Live Server extension (recommended)
# Right-click frontend/index.html → Open with Live Server

# Option B: npx serve
cd vibely/frontend
npx serve .

# Option C: Python
cd vibely/frontend
python3 -m http.server 3000
```

Then visit: `http://localhost:3000` (or whatever port your server uses)

---

## 🔌 API Routes Reference

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (🔒) |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users/search?q=` | Search users (🔒) |
| GET | `/api/users/notifications` | Get notifications (🔒) |
| GET | `/api/users/notifications/count` | Unread count (🔒) |
| PUT | `/api/users/profile` | Update own profile (🔒) |
| GET | `/api/users/:username` | Get user profile (🔒) |
| POST | `/api/users/:id/follow` | Follow / unfollow (🔒) |
| GET | `/api/users/:id/followers` | List followers (🔒) |
| GET | `/api/users/:id/following` | List following (🔒) |

### Posts
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/posts/feed?page=1` | Home feed (🔒) |
| GET | `/api/posts/explore?page=1` | All posts (🔒) |
| GET | `/api/posts/user/:userId` | User's posts (🔒) |
| POST | `/api/posts` | Create post (🔒) |
| GET | `/api/posts/:id` | Single post (🔒) |
| PUT | `/api/posts/:id` | Edit caption (🔒, own) |
| DELETE | `/api/posts/:id` | Delete post (🔒, own) |

### Comments
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/comments/:postId` | Get comments (🔒) |
| POST | `/api/comments/:postId` | Add comment (🔒) |
| DELETE | `/api/comments/:commentId` | Delete comment (🔒, own) |

### Likes
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/likes/:postId` | Like / unlike (🔒) |
| GET | `/api/likes/:postId/users` | Who liked (🔒) |

> 🔒 = Requires `Authorization: Bearer <token>` header

---

## 🛠 Tech Stack

- **Frontend:** HTML5, CSS3 (custom design system), Vanilla JS
- **Backend:** Node.js, Express.js
- **Database:** MySQL 8 with mysql2/promise
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **File Upload:** Multer
- **Real-time:** Socket.io
- **Fonts:** Syne (display) + DM Sans (body) via Google Fonts

---

## 🐛 Troubleshooting

**MySQL connection error:**
- Make sure MySQL is running
- Double-check `DB_PASSWORD` in your `.env`
- Ensure `vibely_db` database exists (run `database.sql` first)

**CORS errors in browser:**
- Make sure backend is running on port 5000
- Open frontend via a local server, not `file://`

**Images not showing:**
- Backend must be running for `/uploads/` to be served
- Check that `uploads/posts/` and `uploads/avatars/` directories exist

**Socket.io not connecting:**
- Backend must be running — socket.io client script loads from `localhost:5000`
