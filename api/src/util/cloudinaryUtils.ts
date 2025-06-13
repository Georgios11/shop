import cloudinary from './cloudinary';

/**
 * Uploads an image to Cloudinary
 * @param {string} imageUrl - URL or file path of the image to upload
 * @param {string} [folder='products'] - Cloudinary folder to store the image
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadImageToCloudinary = async (
  imageUrl: string,
  folder = 'products'
) => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
    });
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};
