/**
 * 🔐 Password Policy and Validation Utility
 * Enforces strong password requirements
 */

// Password policy requirements
const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Optional for easier adoption
  preventCommonPasswords: true,
};

// Common weak passwords to block
const COMMON_PASSWORDS = [
  'password', 'Password', 'Password123', 'password123',
  '12345678', '123456789', 'qwerty', 'abc123',
  'password1', 'admin', 'welcome', 'letmein',
  'monkey', 'dragon', 'master', 'sunshine',
  'princess', 'admin123', 'test123', 'user123',
];

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {Object} - { isValid: boolean, errors: string[], strength: string }
 */
function validatePassword(password) {
  const errors = [];
  let strength = 0;

  // Check if password exists
  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required'],
      strength: 'invalid'
    };
  }

  // Check length
  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters`);
  } else {
    strength += 1;
  }

  if (password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_POLICY.maxLength} characters`);
  }

  // Check uppercase
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) {
    strength += 1;
  }

  // Check lowercase
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) {
    strength += 1;
  }

  // Check numbers
  if (PASSWORD_POLICY.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (/[0-9]/.test(password)) {
    strength += 1;
  }

  // Check special characters (bonus points, not required)
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    strength += 1;
  }

  // Check common passwords
  if (PASSWORD_POLICY.preventCommonPasswords) {
    const lowerPass = password.toLowerCase();
    if (COMMON_PASSWORDS.some(common => lowerPass.includes(common.toLowerCase()))) {
      errors.push('Password is too common. Please choose a more unique password');
    }
  }

  // Determine strength level
  let strengthLevel;
  if (errors.length > 0) {
    strengthLevel = 'weak';
  } else if (strength >= 4) {
    strengthLevel = 'strong';
  } else if (strength >= 3) {
    strengthLevel = 'good';
  } else {
    strengthLevel = 'fair';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: strengthLevel,
    score: strength
  };
}

/**
 * Generate a strong random password
 * @param {number} length - Length of password (default: 12)
 * @returns {string} - Generated password
 */
function generateStrongPassword(length = 12) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  const allChars = uppercase + lowercase + numbers + special;
  let password = '';
  
  // Ensure at least one of each required type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Check if password was recently used
 * @param {string} newPassword - New password
 * @param {Array} passwordHistory - Array of old password hashes
 * @param {Function} compareFunction - bcrypt compare function
 * @returns {Promise<boolean>} - True if password was used before
 */
async function isPasswordReused(newPassword, passwordHistory, compareFunction) {
  if (!passwordHistory || passwordHistory.length === 0) {
    return false;
  }

  for (const oldHash of passwordHistory) {
    const isMatch = await compareFunction(newPassword, oldHash);
    if (isMatch) {
      return true;
    }
  }

  return false;
}

/**
 * Get password strength color for UI
 * @param {string} strength - Strength level
 * @returns {string} - Color code
 */
function getPasswordStrengthColor(strength) {
  const colors = {
    weak: '#dc2626',     // red
    fair: '#f97316',     // orange
    good: '#eab308',     // yellow
    strong: '#22c55e',   // green
    invalid: '#6b7280',  // gray
  };
  return colors[strength] || colors.invalid;
}

/**
 * Calculate password expiry date
 * @param {number} days - Days until expiry (default: 90)
 * @returns {Date} - Expiry date
 */
function calculatePasswordExpiry(days = 90) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return expiryDate;
}

module.exports = {
  PASSWORD_POLICY,
  validatePassword,
  generateStrongPassword,
  isPasswordReused,
  getPasswordStrengthColor,
  calculatePasswordExpiry,
  COMMON_PASSWORDS,
};
