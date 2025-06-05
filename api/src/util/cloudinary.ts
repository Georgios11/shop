import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_URL } from './secrets';

// Configure Cloudinary using the secure option and the Cloudinary URL from your config
cloudinary.config({
  cloudinary_url: CLOUDINARY_URL,
  secure: true,
});

export default cloudinary;
