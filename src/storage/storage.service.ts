import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { handleError } from '../utils/handle.errors.util';
import { StorageBucketType } from './entity/bucket.entity';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  '.xlsx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const DEFAULT_ALLOWED_EXTENSIONS = [
  'xlsx',
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'pdf',
  'doc',
  'docx',
];

type StorageUploadOptions = {
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  maxSizeBytes?: number;
  customFileName?: string;
};

export interface StorageUploadResult {
  publicUrl: string;
  path: string;
  fileName: string;
}

@Injectable()
export class StorageService {
  constructor(private readonly supabase: SupabaseService) {}

  private extractFilePath(fullPath: string, bucket: StorageBucketType): string {
    try {
      const url = new URL(fullPath);
      const pathname = url.pathname;

      const bucketIndex = pathname.indexOf(`/${bucket}/`);
      if (bucketIndex !== -1) {
        return pathname.substring(bucketIndex + bucket.length + 2);
      }

      const segments = fullPath.split('/');
      const idx = segments.indexOf(bucket);
      if (idx !== -1) {
        return segments.slice(idx + 1).join('/');
      }

      throw new Error(`Bucket "${bucket}" didnt found in path sent.`);
    } catch {
      const segments = fullPath.split('/');
      const idx = segments.indexOf(bucket);
      if (idx !== -1) {
        return segments.slice(idx + 1).join('/');
      }
      throw new Error(`Bucket "${bucket}" didnt found in path sent.`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    path: string,
    bucket: StorageBucketType,
    options: StorageUploadOptions = {},
  ): Promise<StorageUploadResult> {
    const supabaseClient = this.supabase.getClient();

    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided or file buffer is empty');
    }

    const maxSize = options.maxSizeBytes ?? 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size exceeds maximum allowed size (10MB)',
      );
    }

    const allowedMimeTypes =
      options.allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES;

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed`,
      );
    }

    const filename = file.originalname;
    const lastDotIndex = filename.lastIndexOf('.');

    if (lastDotIndex === -1) {
      throw new BadRequestException('File must have an extension');
    }

    const ext = filename.substring(lastDotIndex + 1).toLowerCase();
    const allowedExtensions =
      options.allowedExtensions ?? DEFAULT_ALLOWED_EXTENSIONS;

    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException(`File extension .${ext} is not allowed`);
    }

    if (!path || path.trim() === '') {
      throw new BadRequestException('Path cannot be empty');
    }

    const targetFileName = options.customFileName ?? `${uuidv4()}.${ext}`;
    const storagePath = `${path}/${targetFileName}`;

    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      publicUrl: publicUrlData.publicUrl,
      path: data.path,
      fileName: targetFileName,
    };
  }

  async updateFile(
    file: Express.Multer.File,
    path: string,
    bucket: StorageBucketType,
    oldFileUrl?: string,
    options: StorageUploadOptions = {},
  ) {
    const supabaseClient = this.supabase.getClient();

    try {
      if (oldFileUrl) {
        const filePath = this.extractFilePath(oldFileUrl, bucket);
        const { error: removeError } = await supabaseClient.storage
          .from(bucket)
          .remove([filePath]);

        if (removeError) {
          console.warn('Failed to remove old file:', removeError.message);
        }
      }
      const { publicUrl } = await this.uploadFile(file, path, bucket, options);
      return publicUrl;
    } catch (error) {
      console.error('Error in updateFile:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async removeFile(path: string, bucket: StorageBucketType) {
    const supabaseClient = this.supabase.getClient();
    const filePath = this.extractFilePath(path, bucket);
    const { error } = await supabaseClient.storage
      .from(bucket)
      .remove([filePath]);
    if (error) handleError(error as Error);
  }

  async downloadFile(
    pathOrUrl: string,
    bucket: StorageBucketType,
  ): Promise<Buffer> {
    const supabaseClient = this.supabase.getClient();
    const filePath = pathOrUrl.includes(bucket)
      ? this.extractFilePath(pathOrUrl, bucket)
      : pathOrUrl;

    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .download(filePath);

    if (error) {
      console.error('Supabase download error:', error);
      throw new BadRequestException(`Download failed: ${error.message}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
