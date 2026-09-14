import { AssetStorageStrategy } from '@vendure/core';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

export class CloudinaryAssetStorageStrategy implements AssetStorageStrategy {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  private getPublicId(fileName: string): string {
    const normalized = fileName.replace(/\\/g, '/');
    const withoutExtension = normalized.replace(/\.[^/.]+$/, '');

    return `royal-flares/${withoutExtension}`;
  }

  private getUrl(identifier: string): string {
    return cloudinary.url(identifier, {
      secure: true,
      resource_type: 'image',
    });
  }

  async writeFileFromBuffer(
    fileName: string,
    data: Buffer,
  ): Promise<string> {
    const publicId = this.getPublicId(fileName);

    await new Promise<void>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: 'image',
        },
        error => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        },
      );

      uploadStream.end(data);
    });

    return publicId;
  }

  async writeFileFromStream(
    fileName: string,
    data: Readable,
  ): Promise<string> {
    const publicId = this.getPublicId(fileName);

    await new Promise<void>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: 'image',
        },
        error => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        },
      );

      data.pipe(uploadStream);
    });

    return publicId;
  }

  async readFileToBuffer(identifier: string): Promise<Buffer> {
    const response = await fetch(this.getUrl(identifier));

    if (!response.ok) {
      throw new Error(
        `Failed to read Cloudinary asset: ${response.statusText}`,
      );
    }

    return Buffer.from(await response.arrayBuffer());
  }

  async readFileToStream(identifier: string): Promise<Readable> {
    const buffer = await this.readFileToBuffer(identifier);
    return Readable.from(buffer);
  }

  async deleteFile(identifier: string): Promise<void> {
    await cloudinary.uploader.destroy(identifier);
  }

  async fileExists(identifier: string): Promise<boolean> {
    try {
      await cloudinary.api.resource(identifier);
      return true;
    } catch {
      return false;
    }
  }

  toAbsoluteUrl(_request: any, identifier: string): string {
    return this.getUrl(identifier);
  }
}