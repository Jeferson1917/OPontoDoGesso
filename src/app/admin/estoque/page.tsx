    'use client';

    import { useState, useEffect } from 'react';
    import Link from 'next/link';
    import { initialStockState } from '../../data/defaultStock';
    import { StockItem, StockMovement, StockItemKey } from '../../data/stockTypes';
    import { toast } from 'sonner';
    import { 
    Truck, 
    PackageCheck, 
    ArrowLeft, 
    AlertTriangle, 
    ShoppingCart, 
    PlusCircle, 
    Layers, 
    TrendingUp, 
    History 
    } from 'lucide-react';

    export default function AdminStockPage() {
    const [stock, setStock] = useState<Record<string, StockItem>>(initialStockState);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [activeTab, setActiveTab] = useState<'PANORAMA' | 'CAMINHAO' | 'BALCAO'>('PANORAMA');

    // Formulário de Entrada por Caminhão
    const [truckForm, setTruckForm] = useState({
        supplier: 'Polo do Araripe / Gipsita',
        tonsGessoPo: 10,
        platesQuantity: 0,
        gessoCostTotal: 5500,
        freightCost: 2200,
        unloadingLaborCost: 400,
        notes: 'Descarga feita com 2 chapas',
    });

    // Formulário de Venda de Balcão (pro gesseiro autônomo)
    const [saleForm, setSaleForm] = useState<{
        itemId: StockItemKey;
        quantity: number;
        customUnitPrice: number;
        customerName: string;
    }>({
        itemId: 'gessoPoKg',
        quantity: 20, // 1 saco de 20kg
        customUnitPrice: 1.10,
        customerName: '',
    });

    // Persistência no LocalStorage
    useEffect(() => {
        const savedStock = localStorage.getItem('opontodogesso_stock_state');
        const savedMovements = localStorage.getItem('opontodogesso_stock_movements');
        if (savedStock) {
        try { setStock(JSON.parse(savedStock)); } catch {}
        }
        if (savedMovements) {
        try { setMovements(JSON.parse(savedMovements)); } catch {}
        }
    }, []);

    const saveState = (newStock: Record<string, StockItem>, newMovements: StockMovement[]) => {
        setStock(newStock);
        setMovements(newMovements);
        localStorage.setItem('opontodogesso_stock_state', JSON.stringify(newStock));
        localStorage.setItem('opontodogesso_stock_movements', JSON.stringify(newMovements));
    };

    // 1. Processar Chegada de Caminhão Fechado (Entrada por Tonelada)
    const handleRegisterTruck = (e: React.FormEvent) => {
        e.preventDefault();

        const totalWeightKg = truckForm.tonsGessoPo * 1000;
        const totalSpent = Number(truckForm.gessoCostTotal) + Number(truckForm.freightCost) + Number(truckForm.unloadingLaborCost);
        
        // Custo real por kg colocado dentro do galpão
        const calculatedRealCostPerKg = totalWeightKg > 0 ? Number((totalSpent / totalWeightKg).toFixed(3)) : 0.65;

        const currentGesso = stock.gessoPoKg;
        const newQty = currentGesso.currentQuantity + totalWeightKg;
        
        // Média ponderada de custo
        const newAvgCost = Number(
        (((currentGesso.currentQuantity * currentGesso.averageUnitCost) + totalSpent) / newQty).toFixed(3)
        );

        const updatedStock: Record<string, StockItem> = {
        ...stock,
        gessoPoKg: {
            ...currentGesso,
            currentQuantity: newQty,
            averageUnitCost: newAvgCost,
        },
        };

        if (truckForm.platesQuantity > 0) {
        const currentPlates = stock.placaGesso60x60;
        updatedStock.placaGesso60x60 = {
            ...currentPlates,
            currentQuantity: currentPlates.currentQuantity + Number(truckForm.platesQuantity),
        };
        }

        const newMovement: StockMovement = {
        id: String(Date.now()),
        date: new Date().toLocaleDateString('pt-BR'),
        type: 'ENTRADA_CAMINHAO',
        itemId: 'gessoPoKg',
        quantity: totalWeightKg,
        unitPriceOrCost: calculatedRealCostPerKg,
        totalValue: totalSpent,
        description: `Carga de ${truckForm.tonsGessoPo} Toneladas (${truckForm.supplier}) com Frete R$ ${truckForm.freightCost} e Chapa R$ ${truckForm.unloadingLaborCost}`,
        };

        saveState(updatedStock, [newMovement, ...movements]);
        toast.success(`Carga de ${truckForm.tonsGessoPo}T registrada! Custo real rateado: R$ ${(calculatedRealCostPerKg * 20).toFixed(2)} por saco de 20kg.`);
        setActiveTab('PANORAMA');
    };

    // 2. Processar Venda de Balcão pro Gesseiro
    const handleRegisterCounterSale = (e: React.FormEvent) => {
        e.preventDefault();

        const selectedItem = stock[saleForm.itemId];
        const qty = Number(saleForm.quantity);

        if (qty > selectedItem.currentQuantity) {
        toast.error('Quantidade insuficiente em estoque!');
        return;
        }

        const unitPrice = Number(saleForm.customUnitPrice || selectedItem.counterSalePrice);
        const totalSale = qty * unitPrice;
        const estimatedProfit = totalSale - (qty * selectedItem.averageUnitCost);

        const updatedStock: Record<string, StockItem> = {
        ...stock,
        [saleForm.itemId]: {
            ...selectedItem,
            currentQuantity: selectedItem.currentQuantity - qty,
        },
        };

        const newMovement: StockMovement = {
        id: String(Date.now()),
        date: new Date().toLocaleDateString('pt-BR'),
        type: 'VENDA_BALCAO_GESSEIRO',
        itemId: saleForm.itemId,
        quantity: qty,
        unitPriceOrCost: unitPrice,
        totalValue: totalSale,
        description: `Venda Direta (${saleForm.customerName || 'Gesseiro no Balcão'}) - Lucro Estimado: R$ ${estimatedProfit.toFixed(2)}`,
        };

        saveState(updatedStock, [newMovement, ...movements]);
        toast.success(`Venda registrada com sucesso! Total: R$ ${totalSale.toFixed(2)}.`);
        setActiveTab('PANORAMA');
    };

    return (
        <div className="min-h-screen bg-neutral-100 text-neutral-900 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Topo / Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <div className="space-y-1">
                <Link
                href="/admin/orcamento"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-brand-red transition-colors mb-2"
                >
                <ArrowLeft className="w-4 h-4" /> Voltar ao Orçamentista
                </Link>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal-dark">
                Controle de Estoque & Cargas de Gesso
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500">
                Gestão de compras por tonelada/caminhão, consumo em obras e revenda para gesseiros autônomos.
                </p>
            </div>

            <div className="flex items-center gap-2">
                <button
                onClick={() => setActiveTab('PANORAMA')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'PANORAMA'
                    ? 'bg-brand-charcoal-dark text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
                >
                <Layers className="w-4 h-4 inline mr-1" /> Saldo & Alertas
                </button>
                <button
                onClick={() => setActiveTab('CAMINHAO')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'CAMINHAO'
                    ? 'bg-brand-red text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
                >
                <Truck className="w-4 h-4 inline mr-1" /> Chegada de Caminhão
                </button>
                <button
                onClick={() => setActiveTab('BALCAO')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'BALCAO'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
                >
                <ShoppingCart className="w-4 h-4 inline mr-1" /> Venda Balcão
                </button>
            </div>
            </div>

            {/* CONTEÚDO DA ABA: PANORAMA GERAL DO ESTOQUE */}
            {activeTab === 'PANORAMA' && (
            <div className="space-y-6">
                
                {/* Grid dos Itens */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(stock).map((item) => {
                    const isCritical = item.currentQuantity <= item.minThreshold;
                    const isGessoPo = item.id === 'gessoPoKg';
                    const sacos20kg = isGessoPo ? (item.currentQuantity / 20).toFixed(0) : null;
                    const toneladas = isGessoPo ? (item.currentQuantity / 1000).toFixed(2) : null;

                    return (
                    <div
                        key={item.id}
                        className={`bg-white p-5 rounded-2xl border shadow-sm space-y-4 relative overflow-hidden ${
                        isCritical ? 'border-amber-400 bg-amber-50/20' : 'border-neutral-200'
                        }`}
                    >
                        {isCritical && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-lg w-fit">
                            <AlertTriangle className="w-3.5 h-3.5" /> Estoque Baixo • Pedir Carga
                        </div>
                        )}

                        <div>
                        <h3 className="font-bold text-brand-charcoal-dark text-base">{item.name}</h3>
                        <p className="text-xs text-neutral-400">{item.unit}</p>
                        </div>

                        <div className="flex items-baseline justify-between border-y border-neutral-100 py-3">
                        <div>
                            <span className="text-2xl font-black text-brand-charcoal-dark">
                            {item.currentQuantity.toLocaleString('pt-BR')}
                            </span>
                            <span className="text-xs font-semibold text-neutral-400 ml-1">
                            {item.id === 'placaGesso60x60' ? 'un' : 'kg'}
                            </span>
                        </div>

                        {isGessoPo && (
                            <div className="text-right">
                            <p className="text-xs font-bold text-brand-red">{toneladas} Toneladas</p>
                            <p className="text-[11px] text-neutral-500">~{sacos20kg} sacos de 20kg</p>
                            </div>
                        )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-100">
                            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Custo Médio Obra</span>
                            <span className="font-bold text-neutral-700">
                            {item.id === 'gessoPoKg'
                                ? `R$ ${(item.averageUnitCost * 20).toFixed(2)}/saco`
                                : `R$ ${item.averageUnitCost.toFixed(2)}/${item.unit.split(' ')[0]}`}
                            </span>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                            <span className="text-emerald-600 block text-[10px] uppercase font-bold">Preço Balcão</span>
                            <span className="font-bold text-emerald-800">
                            {item.id === 'gessoPoKg'
                                ? `R$ ${(item.counterSalePrice * 20).toFixed(2)}/saco`
                                : `R$ ${item.counterSalePrice.toFixed(2)}/${item.unit.split(' ')[0]}`}
                            </span>
                        </div>
                        </div>
                    </div>
                    );
                })}
                </div>

                {/* Histórico Recente de Entradas e Saídas */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-brand-charcoal-dark text-base flex items-center gap-2">
                    <History className="w-5 h-5 text-neutral-500" /> Movimentações Recentes
                    </h3>
                    <span className="text-xs text-neutral-400">{movements.length} registros</span>
                </div>

                {movements.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-4 text-center">
                    Nenhuma entrada ou saída registrada ainda. Use as abas acima para simular uma carga ou venda.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                        <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase">
                            <th className="py-2.5">Data</th>
                            <th className="py-2.5">Tipo</th>
                            <th className="py-2.5">Descrição</th>
                            <th className="py-2.5 text-right">Volume</th>
                            <th className="py-2.5 text-right">Valor Total</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                        {movements.slice(0, 10).map((mov) => (
                            <tr key={mov.id} className="hover:bg-neutral-50/50">
                            <td className="py-3 font-semibold text-neutral-600">{mov.date}</td>
                            <td className="py-3">
                                <span
                                className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                    mov.type === 'ENTRADA_CAMINHAO'
                                    ? 'bg-blue-100 text-blue-800'
                                    : mov.type === 'VENDA_BALCAO_GESSEIRO'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-neutral-100 text-neutral-700'
                                }`}
                                >
                                {mov.type === 'ENTRADA_CAMINHAO' ? 'Carga Fechada' : 'Venda Balcão'}
                                </span>
                            </td>
                            <td className="py-3 text-neutral-700">{mov.description}</td>
                            <td className="py-3 text-right font-bold text-neutral-800">
                                {mov.quantity.toLocaleString('pt-BR')} {mov.itemId === 'placaGesso60x60' ? 'un' : 'kg'}
                            </td>
                            <td className="py-3 text-right font-black text-brand-charcoal-dark">
                                {mov.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                )}
                </div>

            </div>
            )}

            {/* CONTEÚDO DA ABA: ENTRADA DE CAMINHÃO FECHADO */}
            {activeTab === 'CAMINHAO' && (
            <form onSubmit={handleRegisterTruck} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200 space-y-6">
                <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-bold text-brand-charcoal-dark flex items-center gap-2">
                    <Truck className="w-5 h-5 text-brand-red" /> Lançamento de Caminhão / Carga Fechada
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                    Lança a carga comprada por tonelada e rateia o frete + descarga para calcular o custo real por saco no galpão.
                </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Fornecedor / Origem</label>
                    <input
                    type="text"
                    required
                    value={truckForm.supplier}
                    onChange={(e) => setTruckForm({ ...truckForm, supplier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Toneladas de Gesso em Pó (T)</label>
                    <input
                    type="number"
                    step="0.5"
                    required
                    value={truckForm.tonsGessoPo}
                    onChange={(e) => setTruckForm({ ...truckForm, tonsGessoPo: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                    />
                    <span className="text-[11px] text-neutral-400 mt-1 block">
                    {truckForm.tonsGessoPo * 1000} kg (~{(truckForm.tonsGessoPo * 1000 / 20)} sacos de 20kg)
                    </span>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Placas 60x60 no Caminhão (unidades)</label>
                    <input
                    type="number"
                    value={truckForm.platesQuantity}
                    onChange={(e) => setTruckForm({ ...truckForm, platesQuantity: Number(e.target.value) })}
                    placeholder="0 se for só pó"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                    />
                </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Valor dos Materiais na Fábrica (R$)</label>
                    <input
                    type="number"
                    step="10"
                    required
                    value={truckForm.gessoCostTotal}
                    onChange={(e) => setTruckForm({ ...truckForm, gessoCostTotal: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm bg-white focus:outline-none focus:border-brand-red"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Custo do Frete do Caminhão (R$)</label>
                    <input
                    type="number"
                    step="10"
                    required
                    value={truckForm.freightCost}
                    onChange={(e) => setTruckForm({ ...truckForm, freightCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm bg-white focus:outline-none focus:border-brand-red"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Diária dos Chapas / Descarga (R$)</label>
                    <input
                    type="number"
                    step="10"
                    required
                    value={truckForm.unloadingLaborCost}
                    onChange={(e) => setTruckForm({ ...truckForm, unloadingLaborCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm bg-white focus:outline-none focus:border-brand-red"
                    />
                </div>
                </div>

                {/* Rateio em tempo real */}
                <div className="bg-brand-charcoal-dark text-white p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <p className="text-xs text-neutral-400">Investimento Total na Carga:</p>
                    <p className="text-xl font-black text-brand-red-light">
                    {(Number(truckForm.gessoCostTotal) + Number(truckForm.freightCost) + Number(truckForm.unloadingLaborCost)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-xs text-neutral-400">Custo Real Rateado por Saco de 20kg:</p>
                    <p className="text-lg font-bold text-emerald-400">
                    {truckForm.tonsGessoPo > 0
                        ? `R$ ${(((Number(truckForm.gessoCostTotal) + Number(truckForm.freightCost) + Number(truckForm.unloadingLaborCost)) / (truckForm.tonsGessoPo * 1000)) * 20).toFixed(2)} / saco`
                        : 'R$ 0,00'}
                    </p>
                </div>
                </div>

                <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => setActiveTab('PANORAMA')}
                    className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold hover:bg-neutral-200"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                    <PackageCheck className="w-4 h-4" /> Dar Entrada no Estoque
                </button>
                </div>
            </form>
            )}

            {/* CONTEÚDO DA ABA: VENDA DE BALCÃO PARA GESSEIRO */}
            {activeTab === 'BALCAO' && (
            <form onSubmit={handleRegisterCounterSale} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200 space-y-6">
                <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-bold text-brand-charcoal-dark flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-emerald-600" /> Venda Direta de Balcão (Revenda de Insumos)
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                    Lançamento rápido para gesseiros autônomos e clientes que compram placas ou sacos avulsos no galpão.
                </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Nome do Gesseiro / Cliente</label>
                    <input
                    type="text"
                    placeholder="Ex: Seu Carlos Gesseiro"
                    value={saleForm.customerName}
                    onChange={(e) => setSaleForm({ ...saleForm, customerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Item a Vender</label>
                    <select
                    value={saleForm.itemId}
                    onChange={(e) => {
                        const id = e.target.value as StockItemKey;
                        setSaleForm({
                        ...saleForm,
                        itemId: id,
                        customUnitPrice: stock[id].counterSalePrice,
                        });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm bg-white focus:outline-none focus:border-brand-red"
                    >
                    <option value="gessoPoKg">Gesso em Pó (kg)</option>
                    <option value="placaGesso60x60">Placa de Gesso 60x60cm (un)</option>
                    <option value="gessoColaKg">Gesso Cola (kg)</option>
                    <option value="arameGalvanizadoKg">Arame Galvanizado nº 18 (kg)</option>
                    <option value="sisalKg">Sisal / Juta (kg)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    Quantidade ({saleForm.itemId === 'placaGesso60x60' ? 'unidades' : 'kg'})
                    </label>
                    <input
                    type="number"
                    step="1"
                    required
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm({ ...saleForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                    />
                    {saleForm.itemId === 'gessoPoKg' && (
                    <span className="text-[11px] text-neutral-400 mt-1 block">
                        {(saleForm.quantity / 20).toFixed(1)} sacos de 20kg
                    </span>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Preço Cobrado Unitário (R$)</label>
                    <input
                    type="number"
                    step="0.05"
                    required
                    value={saleForm.customUnitPrice}
                    onChange={(e) => setSaleForm({ ...saleForm, customUnitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-red"
                    />
                </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                <div>
                    <p className="text-xs text-emerald-800 font-bold">Valor Total a Cobrar:</p>
                    <p className="text-xl font-black text-emerald-900">
                    {(saleForm.quantity * saleForm.customUnitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-xs text-emerald-700">Lucro Líquido Estimado:</p>
                    <p className="text-sm font-bold text-emerald-800">
                    + {((saleForm.quantity * saleForm.customUnitPrice) - (saleForm.quantity * stock[saleForm.itemId].averageUnitCost)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
                </div>

                <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => setActiveTab('PANORAMA')}
                    className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold hover:bg-neutral-200"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                    <TrendingUp className="w-4 h-4" /> Concluir Venda & Baixar Estoque
                </button>
                </div>
            </form>
            )}

        </div>
        </div>
    );
    }