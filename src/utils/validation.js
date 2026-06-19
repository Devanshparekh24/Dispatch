const isValidMobile = (mobile) => {
  if (!mobile) return false;
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(String(mobile).trim());
};

const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).trim());
};

const isValidPassword = (password, minLength = 6) => {
  if (!password) return false;
  return password.length >= minLength;
};

const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  return String(value).trim().length === 0;
};

export {
  isValidMobile,
  isValidEmail,
  isValidPassword,
  isEmpty
};
