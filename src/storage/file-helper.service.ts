import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { StorageBucketType } from '../storage/entity/bucket.entity';

type ActionType = 'create' | 'update';

@Injectable()
export class FileHelperService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Gerencia upload de arquivo para create ou update
   * @param action 'create' ou 'update'
   * @param model nome do model Prisma (ex: 'product')
   * @param file arquivo enviado
   * @param bucket bucket do Supabase
   * @param organizationId pasta base do upload (ID da organização)
   * @param id opcional, necessário para 'update'
   * @param imageField campo da imagem no model, em alguns lugares são chamados de 'picture' e em outros de 'image'
   * @returns URL final da imagem
   */
  async handleFile(
    action: ActionType,
    model: keyof PrismaService,
    file: Express.Multer.File | undefined,
    bucket: StorageBucketType,
    organizationId: string,
    id?: string,
    imageField?: string,
  ): Promise<string | undefined> {
    if (!file) return undefined;

    if (!organizationId || organizationId.trim() === '') {
      throw new BadRequestException(
        'Organization ID is required for file upload',
      );
    }

    const folderPath = organizationId;

    if (action === 'create') {
      const { publicUrl } = await this.storageService.uploadFile(
        file,
        folderPath,
        bucket,
      );
      return publicUrl;
    }

    if (action === 'update') {
      if (!id)
        throw new BadRequestException('ID is required for update action');

      if (!imageField) {
        throw new BadRequestException(
          'Image field is required for update action',
        );
      }

      const record = await (this.prisma[model] as any).findUnique({
        where: { id },
      });

      if (!record) {
        throw new BadRequestException(`${String(model)} not found`);
      }

      return this.storageService.updateFile(
        file,
        folderPath,
        bucket,
        record[imageField],
      );
    }

    throw new BadRequestException('Invalid action type');
  }

  /**
   * Gerencia upload de arquivo para create ou update
   * @param id
   * @param model nome do model Prisma (ex: 'product')
   * @param bucket bucket do Supabase
   * @param fieldName nome do campo no model Prisma (ex: 'picture')
   */
  async removeFileByUrl(
    id: string,
    model: keyof PrismaService,
    bucket: StorageBucketType,
    fieldName: string,
  ): Promise<void> {
    const record = await (this.prisma[model] as any).findUnique({
      where: { id },
    });

    if (!record) {
      throw new BadRequestException(`${String(model)} not found`);
    }

    const url: string = record[fieldName];
    if (!url) {
      return;
    }

    await this.storageService.removeFile(url, bucket);
  }
}
