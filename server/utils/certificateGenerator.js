const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate QR Code Base64 Data URL for Certificate Verification URL
 * @param {string} verificationUrl
 * @returns {Promise<string>} Base64 Data URL of QR code image
 */
const generateQRCode = async (verificationUrl) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      color: {
        dark: '#00A76F', // Minimals emerald accent
        light: '#FFFFFF'
      }
    });
    return qrDataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
};

/**
 * Generate unique Certificate UUID v4
 */
const generateCertificateUUID = () => {
  return uuidv4();
};

/**
 * Generate Certificate Verification URL
 */
const buildVerificationUrl = (certificateId) => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  return `${baseUrl}/certificates/verify/${certificateId}`;
};

module.exports = {
  generateQRCode,
  generateCertificateUUID,
  buildVerificationUrl
};
