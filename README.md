# Dezapeguei (Backend NestJS)

API do marketplace P2P Dezapeguei construída em NestJS, com autenticação Supabase, banco PostgreSQL via Prisma, WebSocket para chat e filas BullMQ/Redis.

## Arquitetura e pastas
- `src/app.module.ts`: orquestra módulos e registra BullMQ com Redis.
- `src/auth`: autenticação/JWT usando Supabase Auth; guards/estratégias para rotas protegidas.
- `src/users`: CRUD e busca de usuários.
- `src/categories`: criação/listagem de categorias e keywords.
- `src/offers`: CRUD de ofertas, filtros, status, keywords e especificações.
- `src/sales`: vendas ligadas a ofertas/buyers.
- `src/chats`: criação de chats (1:1 ou grupo), gateway Socket.IO, fila de mensagens.
- `src/messages`: persistência e leitura de mensagens.
- `src/notifications`: notificações vinculadas a usuários.
- `src/wishlists`: listas de desejo e relação N:N com ofertas.
- `src/storage`: upload/download/remover arquivos em buckets Supabase Storage com validação de MIME/extensão/tamanho.
- `src/supabase`: módulo global para client Supabase (auth/storage).
- `src/prisma`: provider do Prisma Client.
- `src/socket-store`: registra socketId por usuário (suporte ao gateway/filas).
- `src/openai`: integração preparada para serviços de IA.
- `docs/API_DOCUMENTATION.md`: catálogo detalhado de endpoints REST e eventos WebSocket.
- `prisma/schema.prisma` + `prisma/models/*.prisma`: modelos (User, Offer, Category, Chat, Message, Wishlist etc.).

## Principais bibliotecas/serviços
- Framework: `@nestjs/common/core/swagger/websockets/platform-socket.io`.
- Banco: `prisma` + `@prisma/client` (PostgreSQL; suporte a Accelerate).
- Mensageria: `@nestjs/bullmq` + `bullmq` + `ioredis` (fila `message-queue`).
- Autenticação/Storage: `@supabase/supabase-js` (auth JWT, buckets).
- Tempo real: `socket.io` (gateway de chat, eventos `message`/`messageSent`/`missedMessages`).
- Utilidades: `class-validator`, `class-transformer`, `uuid`.

## Especificidades
- **BullMQ/Redis**: fila `message-queue` processada em `ChatMessageProcessor`; cria a mensagem, e emite via Socket.IO aos participantes (diferencia remetente com evento `messageSent`). Redis configurável por `REDIS_URL`.
- **Supabase Auth**: emissão/validação de JWT; refresh e perfil via endpoints de auth. Tokens consumidos pelo app Flutter.
- **Supabase Storage**: `StorageService` faz upload seguro (MIME/extensões/tamanho), gera URL pública, remove arquivos antigos e baixa conteúdo quando necessário.
- **Prisma**: modelos separados por domínio em `prisma/models`; enums para status de oferta, condição, planos; índices em chaves de busca.
- **Socket store**: mapeia usuário -> socketId para direcionar eventos sem broadcast desnecessário.
- **Swagger**: disponível em `/api` com bearer auth e duração da requisição.

## Funcionalidades principais
- Autenticação/refresh, perfil e busca de usuário.
- CRUD de categorias, ofertas (com keywords, especificações, promoções), wishlists e vendas.
- Chat em tempo real (1:1 ou grupos), histórico de mensagens e entrega confiável via fila.
- Notificações associadas a usuários.
- Upload de imagens/documentos para Supabase Storage (ex.: fotos de ofertas).

## Execução (desenvolvimento)
1) Pré-requisitos: Node 20+, PostgreSQL, Redis. `npm install -g @nestjs/cli` opcional para CLIs.
2) Copie/crie `.env` na raiz com, por exemplo:
```
DATABASE_URL=postgresql://user:password@localhost:5432/dezapeguei
DIRECT_URL=postgresql://user:password@localhost:5432/dezapeguei
REDIS_URL=redis://localhost:6379
SUPABASE_URL=https://<seu-projeto>.supabase.co
SUPABASE_KEY=<chave-service-role-ou-anon>
SUPABASE_JWT_SECRET=<jwt-secret>
PORT=8080
```
3) Instale dependências: `npm install`.
4) Rode migrações: `npx prisma migrate dev` (ou aponte para migrações existentes em `prisma/migrations`).
5) Seeds opcionais: `npx ts-node prisma/seed-categories.ts` (ajuste o script se necessário).
6) Suba serviços externos: banco Postgres e Redis.
7) Inicie em desenvolvimento: `npm run start:dev` (CORS liberado, Swagger em `/api`).
8) Produção: `npm run build` e `npm run start:prod` (garanta variáveis de ambiente e serviços externos ativos).

## Testes
- Unitários: `npm run test`
- Cobertura: `npm run test:cov`
- E2E (se configurado): `npm run test:e2e`
