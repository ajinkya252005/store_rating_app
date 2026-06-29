/**
 * Shared validation helpers for input fields.
 * All functions return { valid: boolean, error: string|null }
 */

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please provide a valid email address.' };
  }
  return { valid: true, error: null };
};

/**
 * Password must be at least 8 characters, contain at least one uppercase letter
 * and at least one special character.
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character.' };
  }
  return { valid: true, error: null };
};

/**
 * Name must be between 20 and 60 characters.
 */
const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 20) {
    return { valid: false, error: 'Name must be at least 20 characters long.' };
  }
  if (trimmed.length > 60) {
    return { valid: false, error: 'Name must not exceed 60 characters.' };
  }
  return { valid: true, error: null };
};

/**
 * Address must be non-empty and at most 400 characters.
 */
const validateAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Address is required.' };
  }
  if (address.trim().length > 400) {
    return { valid: false, error: 'Address must not exceed 400 characters.' };
  }
  return { valid: true, error: null };
};

/**
 * Rating score must be an integer between 1 and 5 inclusive.
 */
const validateScore = (score) => {
  const parsed = parseInt(score, 10);
  if (isNaN(parsed)) {
    return { valid: false, error: 'Score must be a number.' };
  }
  if (parsed < 1 || parsed > 5) {
    return { valid: false, error: 'Score must be between 1 and 5.' };
  }
  return { valid: true, error: null };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateAddress,
  validateScore,
};
