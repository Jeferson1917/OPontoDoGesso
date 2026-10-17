// src/app/data/schemas.ts
// Validação das entradas das Server Actions: elas são endpoints públicos (POST),
// então nada do que chega do navegador é confiável sem passar por aqui.
import { z } from 'zod';
import { STOCK_ITEM_KEYS } from './stockTypes';

z.config(z.locales.ptBR());

const money = z.number().finite().min(0).max(10_000_000);
const quantity = z.number().finite().min(0).max(1_000_000);
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => (v ? v : undefined));

export const stockItemKeySchema = z.enum(STOCK_ITEM_KEYS);

const serviceTypeSchema = z.enum([
  'FORRO_PLAQUINHA_60X60',
  'REVESTIMENTO_GESSO_LISO',
  'SANCA_ABERTA_GESSO',
  'SANCA_FECHADA_GESSO',
  'MOLDURA_RODATOPO',
  'CORTINEIRO_GESSO',
]);

const roomInputSchema = z.object({
  id: z.string().max(50),
  name: z.string().trim().min(1).max(80),
  lengthMeters: z.number().finite().min(0).max(100),
  widthMeters: z.number().finite().min(0).max(100),
  wallHeightMeters: z.number().finite().min(0).max(10).optional(),
  services: z
    .array(
      z.object({
        type: serviceTypeSchema,
        customLinearMeters: z.number().finite().min(0).max(500).optional(),
      })
    )
    .max(20),
});

const materialSchema = z.object({
  name: z.string().max(120),
  unit: z.enum(['un', 'saco', 'kg', 'm', 'rolo']),
  quantity,
  unitCost: money,
  totalCost: money,
  stockItemKey: stockItemKeySchema.optional(),
  stockQuantity: quantity.optional(),
});

const roomResultSchema = z.object({
  roomName: z.string().max(80),
  areaM2: quantity,
  perimeterMeters: quantity,
  materials: z.array(materialSchema).max(100),
  laborCost: money,
  materialCost: money,
  totalRoomPrice: money,
});

export const createQuoteSchema = z.object({
  clientName: z.string().trim().min(1, 'Informe o nome do cliente.').max(120),
  clientPhone: optionalText(20),
  totalAreaM2: quantity,
  suggestedFinalPrice: money,
  finalAgreedPrice: money,
  discountApplied: money,
  roomsData: z.array(roomInputSchema).min(1, 'Adicione pelo menos um ambiente.').max(50),
  materialsSnapshot: z.array(roomResultSchema).max(50),
  notes: optionalText(2000),
});

export const quoteStatusSchema = z.enum(['PENDENTE', 'APROVADO', 'EM_EXECUCAO', 'CONCLUIDO', 'CANCELADO']);
export const idSchema = z.string().min(1).max(50);

export const truckDeliverySchema = z
  .object({
    supplier: z.string().trim().min(1, 'Informe o fornecedor.').max(120),
    tonsGessoPo: z.number().finite().min(0).max(100),
    platesQuantity: z.number().int('Quantidade de placas deve ser inteira.').min(0).max(100_000),
    gessoCostTotal: money,
    platesCostTotal: money.optional(),
    freightCost: money,
    unloadingLaborCost: money,
    notes: optionalText(2000),
  })
  .refine((d) => d.tonsGessoPo > 0 || d.platesQuantity > 0, 'A carga precisa ter gesso ou placas.');

export const counterSaleSchema = z.object({
  customerName: optionalText(120),
  itemKey: stockItemKeySchema,
  quantity: z.number().finite().positive('Quantidade deve ser maior que zero.').max(1_000_000),
  unitPrice: money,
});

// Valida e devolve os dados limpos, ou uma mensagem curta para a tela
export function parseInput<T extends z.ZodType>(schema: T, data: unknown):
  | { ok: true; data: z.infer<T> }
  | { ok: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  const issue = result.error.issues[0];
  const field = issue.path.length ? ` (${issue.path.join('.')})` : '';
  return { ok: false, error: `Dados inválidos${field}: ${issue.message}` };
}

export const stockAdjustmentSchema = z.object({
  itemKey: stockItemKeySchema,
  countedQuantity: z.number().finite().min(0, 'A quantidade contada não pode ser negativa.').max(10_000_000),
  reason: z.string().trim().min(3, 'Informe o motivo do ajuste.').max(300),
});
