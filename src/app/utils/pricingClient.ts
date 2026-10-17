// src/app/utils/pricingClient.ts
import { getPricingConfigAction, savePricingConfigAction } from '../actions/pricingActions';
import { defaultPricingConfig, sanitizePricingConfig, type PricingConfig } from '../data/pricingConfig';

const LEGACY_STORAGE_KEY = 'opontodogesso_pricing_config';

// Carrega os preços do banco. Na primeira vez, se o banco ainda não tem nada e este
// navegador tem a tabela antiga do localStorage, ela é migrada para o banco e apagada daqui.
export async function loadPricingConfig(): Promise<{ config: PricingConfig; error?: string }> {
  const res = await getPricingConfigAction();
  if (!res.success) return { config: defaultPricingConfig, error: res.error };

  let legacy: string | null = null;
  try {
    legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  } catch {
    // localStorage indisponível (navegação privada etc.)
  }

  if (res.isDefault && legacy) {
    try {
      const saved = await savePricingConfigAction(sanitizePricingConfig(JSON.parse(legacy)));
      if (saved.success) {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return { config: saved.config };
      }
    } catch (err) {
      console.error('Erro ao migrar preços do navegador:', err);
    }
  } else if (legacy) {
    // O banco já tem a tabela oficial; a cópia local é obsoleta
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }

  return { config: res.config };
}
