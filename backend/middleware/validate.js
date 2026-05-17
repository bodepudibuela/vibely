// backend/middleware/validate.js
// Simple validation helpers used in controllers

const validateRegister = (data) => {
  const errors = [];
  const { username, email, password, full_name } = data;

  if (!username || username.trim().length < 3)
    errors.push('Username must be at least 3 characters.');
  if (username && !/^[a-zA-Z0-9_.]+$/.test(username))
    errors.push('Username can only contain letters, numbers, underscores, and dots.');
  if (username && username.length > 30)
    errors.push('Username must be 30 characters or fewer.');
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    errors.push('A valid email is required.');
  if (!password || password.length < 6)
    errors.push('Password must be at least 6 characters.');
  if (full_name && full_name.length > 100)
    errors.push('Full name must be 100 characters or fewer.');

  return errors;
};

const validateLogin = (data) => {
  const errors = [];
  const { email, password } = data;
  if (!email)    errors.push('Email is required.');
  if (!password) errors.push('Password is required.');
  return errors;
};

const validatePost = (data) => {
  const errors = [];
  const { caption } = data;
  if (!caption && !data.hasFile) errors.push('Post must have a caption or an image.');
  if (caption && caption.length > 2200) errors.push('Caption must be 2200 characters or fewer.');
  return errors;
};

const validateComment = (data) => {
  const errors = [];
  const { content } = data;
  if (!content || content.trim().length === 0) errors.push('Comment cannot be empty.');
  if (content && content.length > 500) errors.push('Comment must be 500 characters or fewer.');
  return errors;
};

module.exports = { validateRegister, validateLogin, validatePost, validateComment };
