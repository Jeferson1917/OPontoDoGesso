import { describe, expect, it } from 'vitest';
import { counterSaleSchema, createQuoteSchema, parseInput, truckDeliverySchema } from './schemas';
import { generateProjectQuote } from '../utils/quoteEngine';
import type { RoomInput } from './calculatorTypes';

const rooms: RoomInput[] = [{ id: '1', name: 'Sala', lengthMeters: 5, widthMeters: 4, services: [{ type: 'FORRO_PLAQUINHA_60X60' }] }];
const q = generateProjectQuote(rooms);
const validQuote = {
  clientName: '  Maria  ',
  clientPhone: '',
  totalAreaM2: q.totalAreaM2,
  suggestedFinalPrice: q.suggestedFinalPrice,
  finalAgreedPrice: 1500,
  discountApplied: 93,
  roomsData: rooms,
  materialsSnapshot: q.rooms,
};

describe('createQuoteSchema', () => {
  it('aceita o que a tela de orçamento envia e limpa os textos', () => {
    const r = parseInput(createQuoteSchema, validQuote);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.clientName).toBe('Maria');
      expect(r.data.clientPhone).toBeUndefined();
    }
  });

  it.each([
    ['nome vazio', { clientName: '   ' }, 'clientName'],
    ['preço negativo', { finalAgreedPrice: -1 }, 'finalAgreedPrice'],
    ['sem cômodos', { roomsData: [] }, 'roomsData'],
    ['serviço inventado', { roomsData: [{ ...rooms[0], services: [{ type: 'PISCINA' }] }] }, 'roomsData.0.services.0.type'],
  ])('recusa %s', (_, patch, field) => {
    const r = parseInput(createQuoteSchema, { ...validQuote, ...patch });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain(field);
  });
});

describe('counterSaleSchema', () => {
  it('aceita venda válida', () => expect(parseInput(counterSaleSchema, { itemKey: 'sisalKg', quantity: 2, unitPrice: 15 }).ok).toBe(true));
  it('recusa item inexistente', () => expect(parseInput(counterSaleSchema, { itemKey: 'cimento', quantity: 2, unitPrice: 15 }).ok).toBe(false));
  it('recusa quantidade zero', () => expect(parseInput(counterSaleSchema, { itemKey: 'sisalKg', quantity: 0, unitPrice: 15 }).ok).toBe(false));
});

describe('truckDeliverySchema', () => {
  const truck = { supplier: 'Araripe', tonsGessoPo: 10, platesQuantity: 0, gessoCostTotal: 5500, freightCost: 2200, unloadingLaborCost: 400 };
  it('aceita carga válida', () => expect(parseInput(truckDeliverySchema, truck).ok).toBe(true));
  it('recusa carga vazia', () => expect(parseInput(truckDeliverySchema, { ...truck, tonsGessoPo: 0 }).ok).toBe(false));
  it('recusa placas fracionadas', () => expect(parseInput(truckDeliverySchema, { ...truck, platesQuantity: 1.5 }).ok).toBe(false));
});
