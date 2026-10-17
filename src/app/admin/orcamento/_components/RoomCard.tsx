import { Trash2 } from 'lucide-react';
import type { RoomInput, RoomServiceItem } from '../../../data/calculatorTypes';
import { DEFAULT_WALL_HEIGHT_METERS, MAX_DIMENSION_METERS, MAX_LINEAR_METERS, MAX_WALL_HEIGHT_METERS } from './limits';

interface RoomCardProps {
  room: RoomInput;
  canRemove: boolean;
  onChange: (field: keyof RoomInput, value: string | number) => void;
  onRemove: () => void;
  onAddService: () => void;
  onRemoveService: (serviceIndex: number) => void;
  onServiceChange: (serviceIndex: number, field: keyof RoomServiceItem, value: RoomServiceItem[keyof RoomServiceItem]) => void;
}

export function RoomCard({ room, canRemove, onChange, onRemove, onAddService, onRemoveService, onServiceChange }: RoomCardProps) {
  const hasWallCoating = room.services.some((s) => s.type === 'REVESTIMENTO_GESSO_LISO');
  // Mesmo padrão do motor de orçamento quando a altura não foi informada
  const wallHeight = room.wallHeightMeters || DEFAULT_WALL_HEIGHT_METERS;

  return (
    <section
      className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80 space-y-4"
    >
      {/* Cabeçalho do Cômodo */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
        <div className="flex-1 mr-4">
          <label htmlFor={`room-name-${room.id}`} className="sr-only">
            Nome do Cômodo
          </label>
          <input
            id={`room-name-${room.id}`}
            type="text"
            value={room.name}
            onChange={(e) => onChange("name", e.target.value)}
            className="font-bold text-lg text-brand-charcoal-dark bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-brand-red focus:outline-none px-1 w-full"
          />
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-neutral-400 hover:text-rose-600 transition-colors p-1 rounded-lg"
            aria-label={`Remover cômodo ${room.name}`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Medidas (Largura x Comprimento) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor={`room-length-${room.id}`} className="block text-[11px] font-bold text-neutral-700 uppercase">
            Comprimento (m)
          </label>
          <input
            id={`room-length-${room.id}`}
            type="number"
            min="0"
            max={MAX_DIMENSION_METERS}
            step="0.1"
            value={room.lengthMeters}
            onChange={(e) =>
              onChange("lengthMeters", Number(e.target.value))
            }
            className="w-full mt-1 px-3 py-2 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900"
          />
        </div>
        <div>
          <label htmlFor={`room-width-${room.id}`} className="block text-[11px] font-bold text-neutral-700 uppercase">
            Largura (m)
          </label>
          <input
            id={`room-width-${room.id}`}
            type="number"
            min="0"
            max={MAX_DIMENSION_METERS}
            step="0.1"
            value={room.widthMeters}
            onChange={(e) =>
              onChange("widthMeters", Number(e.target.value))
            }
            className="w-full mt-1 px-3 py-2 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900"
          />
        </div>
        <div className="col-span-2 sm:col-span-1 bg-neutral-50 p-2.5 rounded-xl flex flex-col justify-center border border-neutral-200">
          <span className="text-[10px] text-neutral-600 uppercase font-bold">
            Área Calculada
          </span>
          <span className="text-sm font-black text-brand-charcoal-dark">
            {(room.lengthMeters * room.widthMeters).toFixed(2)} m²
          </span>
        </div>
        {hasWallCoating && (
          <>
            <div>
              <label htmlFor={`room-wall-height-${room.id}`} className="block text-[11px] font-bold text-neutral-700 uppercase">
                Altura da Parede (m)
              </label>
              <input
                id={`room-wall-height-${room.id}`}
                type="number"
                min="0"
                max={MAX_WALL_HEIGHT_METERS}
                step="0.05"
                value={wallHeight}
                onChange={(e) => onChange("wallHeightMeters", Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900"
              />
            </div>
            <div className="col-span-2 bg-neutral-50 p-2.5 rounded-xl flex flex-col justify-center border border-neutral-200">
              <span className="text-[10px] text-neutral-600 uppercase font-bold">
                Área de Parede (revestimento)
              </span>
              <span className="text-sm font-black text-brand-charcoal-dark">
                {(2 * (room.lengthMeters + room.widthMeters) * wallHeight).toFixed(2)} m²
              </span>
            </div>
          </>
        )}
      </div>

      {/* Serviços do Cômodo */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-700 uppercase">
            Serviços Executados neste Cômodo
          </span>
          <button
            type="button"
            onClick={onAddService}
            className="text-xs font-bold text-brand-red hover:underline flex items-center gap-1"
          >
            + Incluir Serviço
          </button>
        </div>

        {room.services.map((srv, srvIdx) => (
          <div
            key={srvIdx}
            className="flex flex-col sm:flex-row items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200"
          >
            <div className="w-full sm:flex-1">
              <label htmlFor={`service-select-${room.id}-${srvIdx}`} className="sr-only">
                Tipo de Serviço
              </label>
              <select
                id={`service-select-${room.id}-${srvIdx}`}
                value={srv.type}
                onChange={(e) =>
                  onServiceChange(srvIdx, "type", e.target.value as RoomServiceItem["type"])
                }
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold bg-white text-neutral-900"
              >
                <option value="FORRO_PLAQUINHA_60X60">
                  Forro Tradicional Plaquinha (60x60)
                </option>
                <option value="REVESTIMENTO_GESSO_LISO">
                  Revestimento de Gesso Liso em Parede
                </option>
                <option value="SANCA_ABERTA_GESSO">Sanca Aberta</option>
                <option value="SANCA_FECHADA_GESSO">Sanca Fechada</option>
                <option value="MOLDURA_RODATOPO">Moldura / Roda-topo</option>
                <option value="CORTINEIRO_GESSO">Cortineiro de Gesso</option>
              </select>
            </div>

            {(srv.type.includes("SANCA") ||
              srv.type.includes("MOLDURA") ||
              srv.type.includes("CORTINEIRO")) && (
              <div className="w-full sm:w-36">
                <label htmlFor={`service-linear-${room.id}-${srvIdx}`} className="sr-only">
                  Metros Lineares
                </label>
                <input
                  id={`service-linear-${room.id}-${srvIdx}`}
                  type="number"
                  min="0"
                  max={MAX_LINEAR_METERS}
                  placeholder="Metros lineares"
                  value={srv.customLinearMeters || ""}
                  onChange={(e) =>
                    onServiceChange(srvIdx, "customLinearMeters", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-900 bg-white"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => onRemoveService(srvIdx)}
              className="text-neutral-400 hover:text-rose-600 p-1 self-end sm:self-center"
              aria-label={`Remover serviço ${srvIdx + 1} do cômodo ${room.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
