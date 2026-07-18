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

const isNumeric = (value) => {
    if (!value) return false;
    return /^[0-9]+$/.test(String(value).trim());
};

const isAlphaNumeric = (value) => {
  if (!value) return true;
  return /^[A-Za-z0-9]+$/.test(String(value).trim());
};

const isValidQRCode = (value, minLength = 15) => {
    if (!value) return false;

    const qr = String(value).trim();

    return /^[0-9]+$/.test(qr) && qr.length >= minLength;
};

const kgToTones=(kg)=>{
  return kg/1000;
}
export {
  isValidMobile,
  isValidEmail,
  isValidPassword,
  isEmpty,
  isNumeric,
  isAlphaNumeric,
  isValidQRCode,
  kgToTones
};
