    // src/app/utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProjectQuote, RoomInput } from '../data/calculatorTypes';

interface PDFQuoteOptions {
  clientName: string;
  clientPhone: string;
  rooms: RoomInput[];
  quote: ProjectQuote;
  notes?: string;
}

export function generateQuotePDF({
  clientName,
  clientPhone,
  rooms,
  quote,
  notes,
}: PDFQuoteOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const today = new Date().toLocaleDateString('pt-BR');
  const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');

  // Cores da Marca (Paleta O Ponto do Gesso)
  const brandRed = [168, 30, 45] as const;      // #A81E2D
  const brandDark = [26, 26, 26] as const;      // #1A1A1A
  const textGray = [100, 100, 100] as const;

  // --- CABEÇALHO ---
  doc.setFillColor(...brandDark);
  doc.rect(0, 0, 210, 36, 'F');

  // Título e Identidade
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('O PONTO DO GESSO', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(210, 210, 210);
  doc.text('Especialistas em Forros Tradicionais, Molduras e Gesso Liso', 14, 25);

  // Faixa decorativa bordô
  doc.setFillColor(...brandRed);
  doc.rect(0, 36, 210, 3, 'F');

  // --- DADOS DO ORÇAMENTO & CLIENTE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...brandDark);
  doc.text('DADOS DO CLIENTE', 14, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textGray);
  doc.text(`Cliente: ${clientName || 'Não informado'}`, 14, 54);
  doc.text(`Contato: ${clientPhone || 'Não informado'}`, 14, 59);

  doc.text(`Data de Emissão: ${today}`, 130, 54);
  doc.text(`Validade da Proposta: 15 dias (${validUntil})`, 130, 59);

  // Linha divisória sutil
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 64, 196, 64);

  // --- DISCRIMINAÇÃO DOS CÔMODOS E SERVIÇOS ---
  const tableBody: (string | number)[][] = [];

  rooms.forEach((room) => {
    const area = (room.lengthMeters * room.widthMeters).toFixed(2);
    
    room.services.forEach((srv, idx) => {
      let serviceLabel = '';
      let detail = `${room.lengthMeters}m x ${room.widthMeters}m (${area} m²)`;

      switch (srv.type) {
        case 'FORRO_PLAQUINHA_60X60':
          serviceLabel = 'Forro de Plaquinha 60x60 (Suspenso)';
          break;
        case 'REVESTIMENTO_GESSO_LISO':
          serviceLabel = 'Revestimento em Gesso Liso';
          break;
        case 'SANCA_ABERTA_GESSO':
          serviceLabel = 'Sanca Aberta com Aba';
          detail = `${srv.customLinearMeters || 'Perímetro'} metros lineares`;
          break;
        case 'SANCA_FECHADA_GESSO':
          serviceLabel = 'Sanca Fechada';
          detail = `${srv.customLinearMeters || 'Perímetro'} metros lineares`;
          break;
        case 'MOLDURA_RODATOPO':
          serviceLabel = 'Moldura de Gesso (Roda-topo)';
          detail = `${srv.customLinearMeters || 'Perímetro'} metros lineares`;
          break;
        case 'CORTINEIRO_GESSO':
          serviceLabel = 'Cortineiro de Gesso Embutido';
          detail = `${srv.customLinearMeters || 'Perímetro'} metros lineares`;
          break;
      }

      tableBody.push([
        idx === 0 ? room.name : '',
        serviceLabel,
        detail,
      ]);
    });
  });

  autoTable(doc, {
    startY: 68,
    head: [['Cômodo / Ambiente', 'Serviço Contratado', 'Dimensões / Metragem']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 26, 26],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [40, 40, 40],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 80 },
      2: { cellWidth: 52 },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // --- RESUMO DO VALOR TOTAL ---
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, finalY, 182, 28, 3, 3, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(14, finalY, 182, 28, 3, 3, 'D');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textGray);
  doc.text(`Área Total Estimada de Execução: ${quote.totalAreaM2} m²`, 20, finalY + 11);
  doc.text('Incluso: Fornecimento de placas, gesso em pó, arame, sisal e aplicação completa.', 20, finalY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...brandRed);
  const priceFormatted = quote.suggestedFinalPrice.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  doc.text(`VALOR TOTAL: ${priceFormatted}`, 130, finalY + 16);

  // --- CONDIÇÕES COMERCIAIS & GARANTIA ---
  const termsY = finalY + 36;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...brandDark);
  doc.text('CONDIÇÕES DE PAGAMENTO & INFORMAÇÕES GERAIS', 14, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textGray);
  const termsText = [
    '• Sinal de 50% no início dos serviços para compra de insumos e 50% na conclusão e aprovação da obra.',
    '• Aceitamos Transferência Bancária, PIX e Cartões de Crédito (com taxa da operadora).',
    '• O local deve estar desimpedido de móveis e com ponto de água e luz disponíveis.',
    '• Garantia de alinhamento, prumo e acabamento fino de acordo com as boas práticas do setor.',
  ];

  termsText.forEach((term, index) => {
    doc.text(term, 14, termsY + 6 + index * 5);
  });

  // --- ASSINATURAS ---
  const signY = termsY + 38;
  doc.setDrawColor(180, 180, 180);
  doc.line(20, signY, 85, signY);
  doc.line(125, signY, 190, signY);

  doc.setFontSize(7.5);
  doc.text('O Ponto do Gesso', 38, signY + 4);
  doc.text('Assinatura do Cliente', 144, signY + 4);

  // Salva o arquivo no navegador
  const fileName = `Orcamento_${(clientName || 'Cliente').replace(/\s+/g, '_')}_PontoDoGesso.pdf`;
  doc.save(fileName);
}