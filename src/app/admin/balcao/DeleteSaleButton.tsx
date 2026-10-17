'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { deleteCounterSaleAction } from '../../actions/stockActions';

export function DeleteSaleButton({ saleId, description }: { saleId: string; description: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm(`Excluir a venda "${description}"? O material volta para o estoque.`)) return;
    startTransition(async () => {
      const res = await deleteCounterSaleAction(saleId);
      if (res.success) {
        toast.success('Venda excluída e material devolvido ao estoque.');
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-colors"
      aria-label={`Excluir venda ${description}`}
      title="Excluir venda (lançada errada)"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
