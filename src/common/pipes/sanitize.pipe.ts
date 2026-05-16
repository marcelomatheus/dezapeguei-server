import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import xss from 'xss';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body' || value == null) {
      return value;
    }

    return this.sanitizeValue(value);
  }

  private sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return xss(value.trim());
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeValue(item));
    }

    if (value && typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>).map(
        ([key, item]) => [key, this.sanitizeValue(item)],
      );
      return Object.fromEntries(entries);
    }

    return value;
  }
}
