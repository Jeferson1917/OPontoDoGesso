// src/app/data/calculatorTypes.ts

export type TraditionalPlasterService =
  | 'FORRO_PLAQUINHA_60X60'     // Forro tradicional suspenso
  | 'REVESTIMENTO_GESSO_LISO'    // Aplicação direta em alvenaria (m²)
  | 'SANCA_ABERTA_GESSO'         // Sanca tradicional fundida/montada
  | 'SANCA_FECHADA_GESSO'        // Sanca fechada / rebaixo perimetral
  | 'MOLDURA_RODATOPO'           // Moldura/roda-forro simples ou trabalhada
  | 'CORTINEIRO_GESSO';          // Cortineiro embutido ou sobreposto

export interface RoomServiceItem {
  type: TraditionalPlasterService;
  comTabicaOuNegativo: boolean; // Se leva dilatação perimetral no forro
  customLinearMeters?: number;  // Metragem linear específica (para sancas, molduras, cortineiros)
}

export interface RoomInput {
  id: string;
  name: string; // Ex: "Sala", "Quarto 1"
  lengthMeters: number;
  widthMeters: number;
  wallHeightMeters?: number; // Para cálculo de gesso liso em paredes
  services: RoomServiceItem[];
}

export interface MaterialRequirement {
  name: string;
  unit: 'un' | 'saco' | 'kg' | 'm' | 'rolo';
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface RoomCalculationResult {
  roomName: string;
  areaM2: number;
  perimeterMeters: number;
  materials: MaterialRequirement[];
  laborCost: number;
  materialCost: number;
  totalRoomPrice: number;
}

export interface ProjectQuote {
  rooms: RoomCalculationResult[];
  totalAreaM2: number;
  totalMaterialCost: number;
  totalLaborCost: number;
  suggestedFinalPrice: number;
}