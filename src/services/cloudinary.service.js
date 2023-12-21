require('dotenv').config();
const cloudinary = require('cloudinary').v2;

const config = {
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

cloudinary.config(config);

const uploadImgToCloudinary = async (fileString, format, fileName, public_id) => {
  try {
    const { uploader } = cloudinary;
    const response = await uploader.upload(`data:image/${format};base64,${fileString}`, {
      discard_original_filename: true,
      filename_override: fileName,
      overwrite: true,
      public_id: public_id,
      unique_filename: false,
      use_filename: false
    });
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteImgFromCloudinary = async function (public_id) {
  try {
    const { uploader } = cloudinary;
    const response = await uploader.destroy(public_id);
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  uploadImgToCloudinary,
  deleteImgFromCloudinary
};

// const uploadToCloudinary = async (filePath) => {
//   try {
//     const { uploader } = cloudinary;

//     const response = await uploader.upload(filePath, {
//       overwrite: true,
//       use_filename: true,
//       unique_filename: false,
//       format: 'jpg'
//     });

//     return response;
//   } catch (error) {
//     throw new Error(error);
//   }
// };
