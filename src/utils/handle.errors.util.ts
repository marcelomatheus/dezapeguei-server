import { UnprocessableEntityException } from '@nestjs/common';

export function handleError(error: Error, context?: string): never {
  const messageLines = error.message.split('\n');
  const messageError = messageLines[messageLines.length - 1].trim();
  if (context) console.error('Error context:', context, error);
  throw new UnprocessableEntityException(
    messageError.concat(` ${context}`) ||
      'Algum erro ocorreu ao executar a operação',
  );
}
