import { OfferCondition, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const now = new Date();

const future = new Date(now);
future.setDate(future.getDate() + 30);

const past = new Date(now);
past.setDate(past.getDate() - 30);

async function main() {
  const categories = [
    {
      id: 'seed-category-1',
      name: 'Eletrônicos',
      keywords: [
        'eletronicos',
        'celular',
        'notebook',
        'tablet',
        'fone',
        'tecnologia',
      ],
    },
    {
      id: 'seed-category-2',
      name: 'Móveis',
      keywords: [
        'moveis',
        'sofa',
        'mesa',
        'cadeira',
        'guarda roupa',
        'estante',
      ],
    },
    {
      id: 'seed-category-3',
      name: 'Roupas',
      keywords: ['roupas', 'moda', 'camisa', 'calca', 'jaqueta', 'tenis'],
    },
    {
      id: 'seed-category-4',
      name: 'Livros',
      keywords: ['livros', 'literatura', 'estudo', 'faculdade', 'apostila'],
    },
    {
      id: 'seed-category-5',
      name: 'Esportes',
      keywords: [
        'esportes',
        'bike',
        'bicicleta',
        'academia',
        'futebol',
        'skate',
      ],
    },
    {
      id: 'seed-category-6',
      name: 'Casa',
      keywords: [
        'casa',
        'cozinha',
        'eletrodomestico',
        'utensilio',
        'organizacao',
      ],
    },
    {
      id: 'seed-category-7',
      name: 'Games',
      keywords: [
        'games',
        'console',
        'playstation',
        'xbox',
        'controle',
        'jogos',
      ],
    },
    {
      id: 'seed-category-8',
      name: 'Bebês',
      keywords: [
        'bebes',
        'carrinho',
        'berco',
        'cadeirinha',
        'brinquedo infantil',
      ],
    },
    {
      id: 'seed-category-9',
      name: 'Ferramentas',
      keywords: [
        'ferramentas',
        'furadeira',
        'parafusadeira',
        'martelete',
        'oficina',
      ],
    },
    {
      id: 'seed-category-10',
      name: 'Decoração',
      keywords: ['decoracao', 'quadro', 'luminaria', 'vaso', 'tapete'],
    },
  ];

  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true,
  });

  const users = [
    {
      id: 'seed-user-1',
      email: 'contato@techreuso.com.br',
      name: 'Tech Reuso Montes Claros',
      phone: '38999990001',
      city: 'Montes Claros',
      state: 'MG',
      entrepreneurVerifiedAt: now,
    },
    {
      id: 'seed-user-2',
      email: 'vendas@casarenova.com.br',
      name: 'Casa Renova',
      phone: '38999990002',
      city: 'Montes Claros',
      state: 'MG',
      entrepreneurVerifiedAt: now,
    },
    {
      id: 'seed-user-3',
      email: 'contato@garimpochic.com.br',
      name: 'Garimpo Chic',
      phone: '38999990003',
      city: 'Belo Horizonte',
      state: 'MG',
      entrepreneurVerifiedAt: null,
    },
    {
      id: 'seed-user-4',
      email: 'atendimento@mundogamerusado.com.br',
      name: 'Mundo Gamer Usado',
      phone: '38999990004',
      city: 'São Paulo',
      state: 'SP',
      entrepreneurVerifiedAt: null,
    },
    {
      id: 'seed-user-5',
      email: 'pedro.almeida@example.com',
      name: 'Pedro Almeida',
      phone: '38999990005',
      city: 'Montes Claros',
      state: 'MG',
      entrepreneurVerifiedAt: null,
    },
    {
      id: 'seed-user-6',
      email: 'mariana.lopes@example.com',
      name: 'Mariana Lopes',
      phone: '38999990006',
      city: 'Contagem',
      state: 'MG',
      entrepreneurVerifiedAt: null,
    },
    {
      id: 'seed-user-7',
      email: 'rafael.costa@example.com',
      name: 'Rafael Costa',
      phone: '38999990007',
      city: 'Montes Claros',
      state: 'MG',
      entrepreneurVerifiedAt: null,
    },
    {
      id: 'seed-user-8',
      email: 'ana.clara@example.com',
      name: 'Ana Clara Martins',
      phone: '38999990008',
      city: 'Belo Horizonte',
      state: 'MG',
      entrepreneurVerifiedAt: null,
    },
    {
      id: 'seed-user-9',
      email: 'lucas.silva@example.com',
      name: 'Lucas Silva',
      phone: '38999990009',
      city: 'São Paulo',
      state: 'SP',
      entrepreneurVerifiedAt: null,
    },
    {
      id: 'seed-user-10',
      email: 'beatriz.ferreira@example.com',
      name: 'Beatriz Ferreira',
      phone: '38999990010',
      city: 'Curitiba',
      state: 'PR',
      entrepreneurVerifiedAt: null,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        ...user,
        plan: 'FREE',
      },
      update: user,
    });
  }

  const entrepreneurProfiles = [
    {
      userId: 'seed-user-1',
      businessName: 'Tech Reuso Montes Claros',
      document: '12.345.678/0001-90',
      businessType: 'Eletrônicos seminovos',
      description:
        'Loja especializada em celulares, notebooks e acessórios seminovos revisados.',
      phone: '38998880001',
      instagram: 'techreuso.moc',
      city: 'Montes Claros',
      state: 'MG',
      status: 'APPROVED' as const,
      expiresAt: future,
      slug: 'tech-reuso-montes-claros',
    },
    {
      userId: 'seed-user-2',
      businessName: 'Casa Renova',
      document: '23.456.789/0001-80',
      businessType: 'Móveis e itens para casa',
      description:
        'Venda de móveis usados em bom estado, decoração e utilidades domésticas.',
      phone: '38998880002',
      instagram: 'casarenova.mg',
      city: 'Montes Claros',
      state: 'MG',
      status: 'APPROVED' as const,
      expiresAt: future,
      slug: 'casa-renova',
    },
    {
      userId: 'seed-user-3',
      businessName: 'Garimpo Chic',
      document: '34.567.890/0001-70',
      businessType: 'Moda circular',
      description:
        'Brechó online com peças femininas e masculinas selecionadas.',
      phone: '31998880003',
      instagram: 'garimpochic',
      city: 'Belo Horizonte',
      state: 'MG',
      status: 'PENDING' as const,
      expiresAt: null,
      slug: 'garimpo-chic',
    },
    {
      userId: 'seed-user-4',
      businessName: 'Mundo Gamer Usado',
      document: '45.678.901/0001-60',
      businessType: 'Games e consoles',
      description: 'Compra e venda de consoles, controles e jogos usados.',
      phone: '11998880004',
      instagram: 'mundogamerusado',
      city: 'São Paulo',
      state: 'SP',
      status: 'REJECTED' as const,
      expiresAt: null,
      slug: 'mundo-gamer-usado',
    },
    {
      userId: 'seed-user-5',
      businessName: 'Oficina do Pedro',
      document: '56.789.012/0001-50',
      businessType: 'Ferramentas usadas',
      description:
        'Ferramentas elétricas e manuais revisadas para pequenos reparos.',
      phone: '38998880005',
      instagram: 'oficinadopedro',
      city: 'Montes Claros',
      state: 'MG',
      status: 'APPROVED' as const,
      expiresAt: past,
      slug: 'oficina-do-pedro',
    },
  ];

  for (const profile of entrepreneurProfiles) {
    await prisma.entrepreneurProfile.upsert({
      where: { userId: profile.userId },
      create: {
        userId: profile.userId,
        businessName: profile.businessName,
        document: profile.document,
        businessType: profile.businessType,
        description: profile.description,
        phone: profile.phone,
        instagram: profile.instagram,
        city: profile.city,
        state: profile.state,
        status: profile.status,
        verifiedAt: profile.status === 'APPROVED' ? now : null,
      },
      update: {
        businessName: profile.businessName,
        businessType: profile.businessType,
        description: profile.description,
        phone: profile.phone,
        instagram: profile.instagram,
        city: profile.city,
        state: profile.state,
        status: profile.status,
        verifiedAt: profile.status === 'APPROVED' ? now : null,
      },
    });

    await prisma.entrepreneurStorefront.upsert({
      where: { userId: profile.userId },
      create: {
        userId: profile.userId,
        slug: profile.slug,
        description: profile.description,
        whatsapp: `55${profile.phone}`,
      },
      update: {
        description: profile.description,
        whatsapp: `55${profile.phone}`,
      },
    });

    const subscriptionStatus =
      profile.expiresAt && profile.expiresAt > now
        ? 'ACTIVE'
        : profile.expiresAt
          ? 'EXPIRED'
          : 'PENDING_PAYMENT';

    const subscription = await prisma.entrepreneurSubscription.create({
      data: {
        userId: profile.userId,
        status: subscriptionStatus,
        startedAt: profile.status === 'APPROVED' ? past : null,
        expiresAt: profile.expiresAt,
        lastPaymentAt: profile.status === 'APPROVED' ? past : null,
      },
    });

    await prisma.paymentSession.create({
      data: {
        userId: profile.userId,
        subscriptionId: subscription.id,
        providerSessionId: `seed-payment-session-${profile.userId}-${Date.now()}`,
        status:
          profile.expiresAt && profile.expiresAt > now
            ? 'PAID'
            : profile.status === 'REJECTED'
              ? 'FAILED'
              : 'CREATED',
        checkoutUrl: `http://localhost:3000/empreendedor/checkout/session/${profile.slug}`,
        successUrl: 'http://localhost:3000/empreendedor/success',
        cancelUrl: 'http://localhost:3000/empreendedor/cancel',
        processedAt: profile.expiresAt && profile.expiresAt > now ? now : null,
        metadata: {
          seed: true,
          plan: 'empreendedor',
          amount: 9900,
          currency: 'BRL',
        },
      },
    });
  }

  const offers = [
    {
      id: 'seed-offer-1',
      title: 'iPhone 12 128GB preto com bateria 86%',
      description:
        'iPhone 12 em bom estado, sem trincos, com marcas leves de uso. Acompanha cabo e capinha.',
      price: 1890,
      imageUrl: ['https://picsum.photos/seed/iphone-12-used/800/600'],
      sellerId: 'seed-user-1',
      categoryId: 'seed-category-1',
      slug: 'iphone-12-128gb-preto-bateria-86',
      condition: OfferCondition.USED_GOOD,
    },
    {
      id: 'seed-offer-2',
      title: 'Notebook Dell Inspiron i5 8GB SSD 256GB',
      description:
        'Notebook revisado, ideal para estudos e trabalho. Possui SSD, carregador original e Windows instalado.',
      price: 2150,
      imageUrl: ['https://picsum.photos/seed/dell-inspiron-i5/800/600'],
      sellerId: 'seed-user-1',
      categoryId: 'seed-category-1',
      slug: 'notebook-dell-inspiron-i5-8gb-ssd-256gb',
      condition: OfferCondition.USED_GOOD,
    },
    {
      id: 'seed-offer-3',
      title: 'Sofá retrátil e reclinável cinza 3 lugares',
      description:
        'Sofá confortável, estrutura firme, tecido limpo e sem rasgos. Retirada por conta do comprador.',
      price: 950,
      imageUrl: ['https://picsum.photos/seed/sofa-cinza-retratil/800/600'],
      sellerId: 'seed-user-2',
      categoryId: 'seed-category-2',
      slug: 'sofa-retratil-reclinavel-cinza-3-lugares',
      condition: OfferCondition.USED_GOOD,
    },
    {
      id: 'seed-offer-4',
      title: 'Mesa de jantar com 4 cadeiras em madeira',
      description:
        'Conjunto usado em ótimo estado. Mesa firme, cadeiras estofadas e prontas para uso.',
      price: 720,
      imageUrl: ['https://picsum.photos/seed/mesa-jantar-madeira/800/600'],
      sellerId: 'seed-user-2',
      categoryId: 'seed-category-2',
      slug: 'mesa-de-jantar-com-4-cadeiras-madeira',
      condition: OfferCondition.USED_GOOD,
    },
    {
      id: 'seed-offer-5',
      title: 'Jaqueta jeans oversized seminova',
      description:
        'Jaqueta jeans azul, tamanho M/G, usada poucas vezes. Sem manchas ou avarias.',
      price: 89,
      imageUrl: ['https://picsum.photos/seed/jaqueta-jeans-oversized/800/600'],
      sellerId: 'seed-user-3',
      categoryId: 'seed-category-3',
      slug: 'jaqueta-jeans-oversized-seminova',
      condition: OfferCondition.USED_LIKE_NEW,
    },
    {
      id: 'seed-offer-6',
      title: 'Kit 3 livros de programação JavaScript e Node.js',
      description:
        'Livros usados para estudo, com algumas marcações a lápis. Conteúdo em ótimo estado.',
      price: 145,
      imageUrl: ['https://picsum.photos/seed/livros-javascript-node/800/600'],
      sellerId: 'seed-user-7',
      categoryId: 'seed-category-4',
      slug: 'kit-3-livros-programacao-javascript-nodejs',
      condition: OfferCondition.USED_GOOD,
    },
    {
      id: 'seed-offer-7',
      title: 'Bicicleta aro 29 alumínio Shimano',
      description:
        'Bike aro 29 com câmbio Shimano, pneus bons e revisão feita recentemente.',
      price: 1280,
      imageUrl: ['https://picsum.photos/seed/bicicleta-aro-29-shimano/800/600'],
      sellerId: 'seed-user-9',
      categoryId: 'seed-category-5',
      slug: 'bicicleta-aro-29-aluminio-shimano',
      condition: OfferCondition.USED_GOOD,
    },
    {
      id: 'seed-offer-8',
      title: 'Air fryer Mondial 4L usada poucas vezes',
      description:
        'Air fryer funcionando perfeitamente, cesto conservado e sem cheiro. Ideal para casal ou família pequena.',
      price: 230,
      imageUrl: ['https://picsum.photos/seed/air-fryer-mondial-4l/800/600'],
      sellerId: 'seed-user-6',
      categoryId: 'seed-category-6',
      slug: 'air-fryer-mondial-4l-usada-poucas-vezes',
      condition: OfferCondition.USED_LIKE_NEW,
    },
    {
      id: 'seed-offer-9',
      title: 'PlayStation 4 Slim 1TB com 2 controles',
      description:
        'Console em bom estado, acompanha dois controles, cabo HDMI, cabo de energia e 3 jogos físicos.',
      price: 1650,
      imageUrl: ['https://picsum.photos/seed/playstation-4-slim-1tb/800/600'],
      sellerId: 'seed-user-4',
      categoryId: 'seed-category-7',
      slug: 'playstation-4-slim-1tb-com-2-controles',
      condition: OfferCondition.USED_GOOD,
    },
    {
      id: 'seed-offer-10',
      title: 'Carrinho de bebê Burigotto dobrável',
      description:
        'Carrinho dobrável, confortável e fácil de transportar. Possui sinais normais de uso.',
      price: 380,
      imageUrl: ['https://picsum.photos/seed/carrinho-bebe-burigotto/800/600'],
      sellerId: 'seed-user-8',
      categoryId: 'seed-category-8',
      slug: 'carrinho-de-bebe-burigotto-dobravel',
      condition: OfferCondition.USED_GOOD,
    },
    {
      id: 'seed-offer-11',
      title: 'Parafusadeira Bosch 12V com maleta',
      description:
        'Parafusadeira funcionando normalmente, acompanha bateria, carregador e maleta original.',
      price: 310,
      imageUrl: ['https://picsum.photos/seed/parafusadeira-bosch-12v/800/600'],
      sellerId: 'seed-user-5',
      categoryId: 'seed-category-9',
      slug: 'parafusadeira-bosch-12v-com-maleta',
      condition: OfferCondition.USED_GOOD,
    },
    {
      id: 'seed-offer-12',
      title: 'Luminária de piso preta estilo industrial',
      description:
        'Luminária decorativa funcionando, estrutura metálica e design moderno para sala ou escritório.',
      price: 180,
      imageUrl: [
        'https://picsum.photos/seed/luminaria-piso-industrial/800/600',
      ],
      sellerId: 'seed-user-10',
      categoryId: 'seed-category-10',
      slug: 'luminaria-de-piso-preta-estilo-industrial',
      condition: OfferCondition.USED_LIKE_NEW,
    },
  ];

  for (const offer of offers) {
    await prisma.offer.upsert({
      where: { id: offer.id },
      create: offer,
      update: {
        title: offer.title,
        description: offer.description,
        price: offer.price,
        imageUrl: offer.imageUrl,
        sellerId: offer.sellerId,
        categoryId: offer.categoryId,
        slug: offer.slug,
        condition: offer.condition,
      },
    });
  }

  await prisma.entrepreneurFeaturedOffer.createMany({
    data: [
      { userId: 'seed-user-1', offerId: 'seed-offer-1' },
      { userId: 'seed-user-1', offerId: 'seed-offer-2' },
      { userId: 'seed-user-2', offerId: 'seed-offer-3' },
      { userId: 'seed-user-2', offerId: 'seed-offer-4' },
      { userId: 'seed-user-5', offerId: 'seed-offer-11' },
    ],
    skipDuplicates: true,
  });

  await prisma.community.createMany({
    data: [
      {
        id: 'seed-community-electronics',
        name: 'Achados de Eletrônicos',
        slug: 'achados-de-eletronicos',
        description:
          'Comunidade para divulgar celulares, notebooks, acessórios e eletrônicos seminovos.',
      },
      {
        id: 'seed-community-home',
        name: 'Casa, Móveis e Decoração',
        slug: 'casa-moveis-e-decoracao',
        description:
          'Ofertas de móveis usados, decoração, eletrodomésticos e itens para casa.',
      },
      {
        id: 'seed-community-fashion',
        name: 'Moda Circular',
        slug: 'moda-circular',
        description:
          'Espaço para roupas, calçados e acessórios seminovos em bom estado.',
      },
      {
        id: 'seed-community-games',
        name: 'Games e Consoles',
        slug: 'games-e-consoles',
        description:
          'Comunidade para consoles, jogos, controles e acessórios gamer.',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.communityMember.createMany({
    data: users.flatMap((user) => [
      { communityId: 'seed-community-electronics', userId: user.id },
      { communityId: 'seed-community-home', userId: user.id },
      { communityId: 'seed-community-fashion', userId: user.id },
      { communityId: 'seed-community-games', userId: user.id },
    ]),
    skipDuplicates: true,
  });

  await prisma.communityMessage.createMany({
    data: [
      {
        communityId: 'seed-community-electronics',
        userId: 'seed-user-1',
        content:
          'Pessoal, chegou um iPhone 12 revisado na loja. Bateria em 86% e aparelho sem trincos.',
        offerId: 'seed-offer-1',
        type: 'OFFER',
      },
      {
        communityId: 'seed-community-electronics',
        userId: 'seed-user-1',
        content:
          'Também temos um Dell Inspiron com SSD, boa opção para estudo e trabalho remoto.',
        offerId: 'seed-offer-2',
        type: 'OFFER',
      },
      {
        communityId: 'seed-community-home',
        userId: 'seed-user-2',
        content:
          'Disponível sofá retrátil em ótimo estado. Ideal para quem está montando apartamento.',
        offerId: 'seed-offer-3',
        type: 'OFFER',
      },
      {
        communityId: 'seed-community-home',
        userId: 'seed-user-2',
        content:
          'Mesa de jantar com 4 cadeiras disponível para retirada em Montes Claros.',
        offerId: 'seed-offer-4',
        type: 'OFFER',
      },
      {
        communityId: 'seed-community-fashion',
        userId: 'seed-user-3',
        content:
          'Separei algumas peças seminovas essa semana. A jaqueta jeans está praticamente nova.',
        offerId: 'seed-offer-5',
        type: 'OFFER',
      },
      {
        communityId: 'seed-community-games',
        userId: 'seed-user-4',
        content:
          'PS4 Slim 1TB com dois controles e jogos físicos disponível para negociação.',
        offerId: 'seed-offer-9',
        type: 'OFFER',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.wishlist.createMany({
    data: [
      { userId: 'seed-user-6', offerId: 'seed-offer-1' },
      { userId: 'seed-user-6', offerId: 'seed-offer-3' },
      { userId: 'seed-user-7', offerId: 'seed-offer-2' },
      { userId: 'seed-user-7', offerId: 'seed-offer-8' },
      { userId: 'seed-user-8', offerId: 'seed-offer-5' },
      { userId: 'seed-user-8', offerId: 'seed-offer-10' },
      { userId: 'seed-user-9', offerId: 'seed-offer-11' },
      { userId: 'seed-user-10', offerId: 'seed-offer-12' },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    console.log('Seeds de ecommerce criados com sucesso.');
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
