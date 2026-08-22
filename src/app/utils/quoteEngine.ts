    // src/app/utils/quoteEngine.ts
import { RoomInput, RoomCalculationResult, MaterialRequirement, ProjectQuote } from '../data/calculatorTypes';
import { defaultPricingConfig } from '../data/pricingConfig';

const clampMetric = (value: number | undefined, max: number, fallback = 0) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, 0), max);
};

export function calculateRoomQuote(
  room: RoomInput,
  config = defaultPricingConfig
): RoomCalculationResult {
  const safeLength = clampMetric(room.lengthMeters, 100, 0);
  const safeWidth = clampMetric(room.widthMeters, 100, 0);
  const area = safeLength * safeWidth;
  const perimeter = 2 * (safeLength + safeWidth);

  const materials: MaterialRequirement[] = [];
  let laborCost = 0;

  room.services.forEach((service) => {
    switch (service.type) {
      case 'FORRO_PLAQUINHA_60X60': {
        laborCost += area * config.laborRates.FORRO_PLAQUINHA_60X60;

        // Placas 60x60cm (0.36 m² por placa) com quebra
        const placasQtd = Math.ceil((area / 0.36) * config.wasteFactor);
        materials.push({
          name: 'Placa de Gesso 60x60cm',
          unit: 'un',
          quantity: placasQtd,
          unitCost: config.materialCosts.placaGesso60x60,
          totalCost: placasQtd * config.materialCosts.placaGesso60x60,
        });

        // Gesso em pó para chumbamento e rejunte (1 saco 20kg a cada 7m²)
        const sacosGesso = Math.ceil(area / 7);
        materials.push({
          name: 'Gesso em Pó (Saco 20kg)',
          unit: 'saco',
          quantity: sacosGesso,
          unitCost: config.materialCosts.gessoPo20kg,
          totalCost: sacosGesso * config.materialCosts.gessoPo20kg,
        });

        // Arame Galvanizado nº 18 (~0.12 kg por m²)
        const arameKg = Math.ceil(area * 0.12);
        materials.push({
          name: 'Arame Galvanizado nº 18',
          unit: 'kg',
          quantity: arameKg,
          unitCost: config.materialCosts.arameGalvanizado18Kg,
          totalCost: arameKg * config.materialCosts.arameGalvanizado18Kg,
        });

        // Sisal / Estopa para chumbamento (~0.10 kg por m²)
        const sisalKg = Math.ceil(area * 0.10);
        materials.push({
          name: 'Sisal / Juta para Fixação',
          unit: 'kg',
          quantity: Math.max(1, sisalKg),
          unitCost: config.materialCosts.sisalJutaKg,
          totalCost: Math.max(1, sisalKg) * config.materialCosts.sisalJutaKg,
        });

        // Gesso Cola para emendas/acabamento (~0.3 kg por m²)
        const gessoColaKg = Math.ceil(area * 0.3);
        materials.push({
          name: 'Gesso Cola',
          unit: 'kg',
          quantity: Math.max(1, gessoColaKg),
          unitCost: config.materialCosts.gessoColaKg,
          totalCost: Math.max(1, gessoColaKg) * config.materialCosts.gessoColaKg,
        });
        break;
      }

      case 'REVESTIMENTO_GESSO_LISO': {
        const wallHeight = clampMetric(room.wallHeightMeters || 2.8, 10, 2.8);
        const wallArea = perimeter * wallHeight;
        laborCost += wallArea * config.laborRates.REVESTIMENTO_GESSO_LISO;

        // Consumo de gesso lento/liso: aprox. 1 saco de 20kg para cada 2.5 m² (espessura média 1.5cm)
        const sacosParede = Math.ceil(wallArea / 2.5);
        materials.push({
          name: 'Gesso Liso para Revestimento (Saco 20kg)',
          unit: 'saco',
          quantity: sacosParede,
          unitCost: config.materialCosts.gessoPo20kg,
          totalCost: sacosParede * config.materialCosts.gessoPo20kg,
        });
        break;
      }

      case 'SANCA_ABERTA_GESSO':
      case 'SANCA_FECHADA_GESSO': {
        const linearM = clampMetric(service.customLinearMeters ?? perimeter, 500, perimeter);
        const rate = service.type === 'SANCA_ABERTA_GESSO'
          ? config.laborRates.SANCA_ABERTA_GESSO
          : config.laborRates.SANCA_FECHADA_GESSO;

        laborCost += linearM * rate;

        // Placas e gesso consumidos no fechamento da sanca
        const sacosSanca = Math.ceil(linearM / 4);
        materials.push({
          name: `Gesso & Insumos para ${service.type === 'SANCA_ABERTA_GESSO' ? 'Sanca Aberta' : 'Sanca Fechada'}`,
          unit: 'saco',
          quantity: Math.max(1, sacosSanca),
          unitCost: config.materialCosts.gessoPo20kg,
          totalCost: Math.max(1, sacosSanca) * config.materialCosts.gessoPo20kg,
        });
        break;
      }

      case 'MOLDURA_RODATOPO':
      case 'CORTINEIRO_GESSO': {
        const linearM = clampMetric(service.customLinearMeters ?? perimeter, 500, perimeter);
        const rate = service.type === 'MOLDURA_RODATOPO'
          ? config.laborRates.MOLDURA_RODATOPO
          : config.laborRates.CORTINEIRO_GESSO;

        laborCost += linearM * rate;

        const gessoColaLinear = Math.ceil(linearM * 0.2);
        materials.push({
          name: `Peças e Cola para ${service.type === 'MOLDURA_RODATOPO' ? 'Moldura' : 'Cortineiro'}`,
          unit: 'm',
          quantity: Math.ceil(linearM),
          unitCost: config.materialCosts.metroMolduraFabricada,
          totalCost: Math.ceil(linearM) * config.materialCosts.metroMolduraFabricada,
        });
        materials.push({
          name: 'Gesso Cola para Instalação',
          unit: 'kg',
          quantity: Math.max(1, gessoColaLinear),
          unitCost: config.materialCosts.gessoColaKg,
          totalCost: Math.max(1, gessoColaLinear) * config.materialCosts.gessoColaKg,
        });
        break;
      }
    }
  });

  const materialCost = materials.reduce((acc, item) => acc + item.totalCost, 0);

  return {
    roomName: room.name,
    areaM2: Number(area.toFixed(2)),
    perimeterMeters: Number(perimeter.toFixed(2)),
    materials,
    laborCost: Number(laborCost.toFixed(2)),
    materialCost: Number(materialCost.toFixed(2)),
    totalRoomPrice: Number((laborCost + materialCost).toFixed(2)),
  };
}

export function generateProjectQuote(rooms: RoomInput[], config = defaultPricingConfig): ProjectQuote {
  const roomResults = rooms.map((r) => calculateRoomQuote(r, config));

  const totalAreaM2 = roomResults.reduce((acc, r) => acc + r.areaM2, 0);
  const totalMaterialCost = roomResults.reduce((acc, r) => acc + r.materialCost, 0);
  const totalLaborCost = roomResults.reduce((acc, r) => acc + r.laborCost, 0);

  const rawTotal = (totalMaterialCost + totalLaborCost) * config.profitMarginMultiplier;
  const suggestedFinalPrice = Math.max(rawTotal, config.minimumProjectPrice);

  return {
    rooms: roomResults,
    totalAreaM2: Number(totalAreaM2.toFixed(2)),
    totalMaterialCost: Number(totalMaterialCost.toFixed(2)),
    totalLaborCost: Number(totalLaborCost.toFixed(2)),
    suggestedFinalPrice: Number(suggestedFinalPrice.toFixed(2)),
  };
}