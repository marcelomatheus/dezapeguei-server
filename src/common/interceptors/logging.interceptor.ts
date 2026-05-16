import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'crypto';

/**
 * Request Logging Interceptor
 * Logs incoming requests and their responses for monitoring
 * Following Constitution Principle VII: Backend Modular Architecture
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly searchThresholdMs = 1000;
  private readonly offerStatusThresholdMs = 5000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      ip: string;
      query?: Record<string, unknown>;
      get: (header: string) => string | undefined;
      headers?: Record<string, string | string[] | undefined>;
    }>();
    const response = context.switchToHttp().getResponse<{
      statusCode: number;
      setHeader: (name: string, value: string) => void;
    }>();

    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();
    const headerCorrelationId = request.headers?.['x-correlation-id'];
    const correlationId =
      typeof headerCorrelationId === 'string' && headerCorrelationId.length > 0
        ? headerCorrelationId
        : randomUUID();

    response.setHeader('x-correlation-id', correlationId);

    this.logger.log(
      `Incoming Request: ${method} ${url} - ${ip} - ${userAgent} - CID: ${correlationId}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = response;
          const duration = Date.now() - startTime;

          const hasSearchQuery =
            typeof request.query?.search === 'string' &&
            request.query.search.length > 0;
          const isSlowSearch =
            hasSearchQuery && duration > this.searchThresholdMs;
          const isOfferStatusUpdate =
            method === 'PATCH' && /\/offers\/.+\/status/.test(url);
          const isSlowOfferStatusUpdate =
            isOfferStatusUpdate && duration > this.offerStatusThresholdMs;

          if (isSlowSearch) {
            this.logger.warn(
              `PERF_ALERT SC-005: Slow search request ${method} ${url} - Duration: ${duration}ms (threshold: ${this.searchThresholdMs}ms) - CID: ${correlationId}`,
            );
          }

          if (isSlowOfferStatusUpdate) {
            this.logger.warn(
              `PERF_ALERT SC-007: Slow offer status propagation request ${method} ${url} - Duration: ${duration}ms (threshold: ${this.offerStatusThresholdMs}ms) - CID: ${correlationId}`,
            );
          }

          this.logger.log(
            `Completed: ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms - CID: ${correlationId}`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `Failed: ${method} ${url} - Error: ${error.message} - Duration: ${duration}ms - CID: ${correlationId}`,
          );
        },
      }),
    );
  }
}
