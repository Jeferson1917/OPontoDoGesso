import { Prisma, PrismaClient } from '@prisma/client';

// Valores em dinheiro ficam como DECIMAL no banco (exatos, arredondados em centavos),
// mas o restante do app trabalha com number. A conversão acontece aqui, num lugar só.
// Atenção: aggregate e $queryRaw não passam por esta extensão — use toNumber() neles.
export const toNumber = (value: Prisma.Decimal | number | null | undefined) => (value == null ? 0 : Number(value));

const decimalFields = <T extends string>(...fields: T[]) =>
  Object.fromEntries(
    fields.map((field) => [
      field,
      {
        needs: { [field]: true },
        compute: (row: Record<T, Prisma.Decimal>) => toNumber(row[field]),
      },
    ])
  ) as { [K in T]: { needs: { [P in K]: true }; compute: (row: Record<K, Prisma.Decimal>) => number } };

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }).$extends({
    result: {
      quote: decimalFields('suggestedFinalPrice', 'finalAgreedPrice', 'discountApplied'),
      truckDelivery: decimalFields('gessoCostTotal', 'platesCostTotal', 'freightCost', 'unloadingLaborCost', 'realCostPerKg'),
      counterSale: decimalFields('unitPrice', 'totalValue', 'estimatedProfit'),
      pricingConfig: decimalFields('minimumProjectPrice'),
      stockBalance: decimalFields('averageUnitCost', 'counterSalePrice'),
    },
  });
}

const globalForPrisma = global as unknown as { prisma: ReturnType<typeof createPrismaClient> };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
