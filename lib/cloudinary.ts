import { v2 as cloudinary } from 'cloudinary';

// بررسی اینکه environment variables تنظیم شده‌اند
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('⚠️ Environment variables برای Cloudinary تنظیم نشده‌اند!');
  console.error('لطفاً این متغیرها را در .env.local تنظیم کنید:');
  console.error('CLOUDINARY_CLOUD_NAME=dixlzz20o');
  console.error('CLOUDINARY_API_KEY=258218736417715');
  console.error('CLOUDINARY_API_SECRET=HxjgoSr-jd5smXT8aN4ZkpVLInc');
}

// تنظیمات Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * آپلود تصویر به Cloudinary
 * @param file - فایل تصویر (Buffer یا base64)
 * @param folder - پوشه ذخیره‌سازی (مثلاً 'games')
 * @returns URL تصویر آپلود شده
 */
export async function uploadImage(
  file: Buffer | string,
  folder: string = 'games'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folder,
      resource_type: 'image' as const,
      transformation: [
        {
          width: 1200,
          height: 1200,
          crop: 'limit',
          quality: 'auto',
          format: 'auto',
        },
      ],
    };

    if (Buffer.isBuffer(file)) {
      // اگر فایل Buffer است
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) {
            reject(error);
          } else if (result?.secure_url) {
            resolve(result.secure_url);
          } else {
            reject(new Error('آپلود ناموفق بود'));
          }
        })
        .end(file);
    } else {
      // اگر فایل base64 است
      cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
        if (error) {
          reject(error);
        } else if (result?.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error('آپلود ناموفق بود'));
        }
      });
    }
  });
}

/**
 * حذف تصویر از Cloudinary
 * @param imageUrl - URL تصویر برای حذف
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // استخراج public_id از URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename.split('.')[0];
    const folder = urlParts[urlParts.length - 2];

    const fullPublicId = folder ? `${folder}/${publicId}` : publicId;

    await cloudinary.uploader.destroy(fullPublicId);
  } catch (error) {
    console.error('خطا در حذف تصویر:', error);
    // در صورت خطا، ادامه می‌دهیم (تصویر ممکن است از قبل حذف شده باشد)
  }
}

