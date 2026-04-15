import { v2 as cloudinary } from 'cloudinary';

let configured = false;

const ensureCloudinaryConfigured = (): void => {
  if (configured) {
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary no configurado. Define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.'
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  configured = true;
};

const uploadBufferToCloudinary = async (
  fileBuffer: Buffer,
  folder: string
): Promise<string> => {
  ensureCloudinaryConfigured();

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error('No se pudo subir el archivo a Cloudinary.'));
          return;
        }

        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export { uploadBufferToCloudinary };