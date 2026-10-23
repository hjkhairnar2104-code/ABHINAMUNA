/**
 * Cloudinary Direct Upload Service for SmartEV Admin Portal
 * Uses the user's provided credentials:
 * CLOUDINARY_CLOUD_NAME = 'ds7dkwyfp'
 * CLOUDINARY_API_KEY = '859773328792931'
 * CLOUDINARY_API_SECRET = '4w0gCyDyenYp-azh4mWUU7rKECg'
 */

const CLOUDINARY_CLOUD_NAME = 'ds7dkwyfp';
const CLOUDINARY_API_KEY = '859773328792931';
const CLOUDINARY_API_SECRET = '4w0gCyDyenYp-azh4mWUU7rKECg';

/**
 * Computes SHA-1 hash for Cloudinary signed upload
 * Works in all modern browsers using window.crypto.subtle
 */
async function computeSha1(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Uploads an image file or Base64 string to Cloudinary
 * @param {File|Blob|string} fileOrDataUrl - Image file object or base64 data url
 * @param {string} [folder='smartev_stations'] - Optional folder name in Cloudinary
 * @returns {Promise<{url: string, secure_url: string, public_id: string}>}
 */
export async function uploadToCloudinary(fileOrDataUrl, folder = 'smartev_stations') {
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Cloudinary signature requires parameters sorted alphabetically: folder, timestamp
  const strToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signature = await computeSha1(strToSign);

  const formData = new FormData();
  formData.append('file', fileOrDataUrl);
  formData.append('api_key', CLOUDINARY_API_KEY);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  formData.append('signature', signature);

  const uploadEndpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const response = await fetch(uploadEndpoint, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Cloudinary upload failed with status ${response.status}`);
  }

  const result = await response.json();
  return {
    url: result.url,
    secure_url: result.secure_url,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format
  };
}

export const CLOUDINARY_CONFIG = {
  cloudName: CLOUDINARY_CLOUD_NAME,
  apiKey: CLOUDINARY_API_KEY
};
