import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { handleError } from '../../utils/handle.errors.util';
import { StorageBucketType } from './entity/bucket.entity';
import { v4 as uuidv4 } from 'uuid';

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
  ) {
    const supabaseClient = this.supabase.getClient();

    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided or file buffer is empty');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size exceeds maximum allowed size (10MB)',
      );
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

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
    const allowedExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'pdf',
      'doc',
      'docx',
    ];

    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException(`File extension .${ext} is not allowed`);
    }

    if (!path || path.trim() === '') {
      throw new BadRequestException('Path cannot be empty');
    }

    const randomName = `${uuidv4()}.${ext}`;

    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(`${path}/${randomName}`, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }

  async updateFile(
    file: Express.Multer.File,
    path: string,
    bucket: StorageBucketType,
    oldFileUrl?: string,
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
      return await this.uploadFile(file, path, bucket);
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
}
