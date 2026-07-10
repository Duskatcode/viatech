import PDFDocument from 'pdfkit';

interface PdfTask {
  title: string;
  description?: string | null;
  isCompleted: boolean;
}

interface BuildMaintenanceOrderPdfParams {
  order: {
    code: string;
    type: string;
    status: string;
    scheduledDate?: Date | string | null;
    startedAt?: Date | string | null;
    completedAt?: Date | string | null;
    description?: string | null;
    diagnosis?: string | null;
    actionsPerformed?: string | null;
    recommendations?: string | null;
    finalEquipmentStatus?: string | null;
    createdAt: Date | string;
    equipment?: {
      internalCode: string;
      name: string;
      brand?: string | null;
      model?: string | null;
      serialNumber?: string | null;
      equipmentType?: string | null;
      riskLevel?: string | null;
      status: string;
      company?: {
        name: string;
        nit?: string | null;
      } | null;
      site?: {
        name: string;
        city?: string | null;
      } | null;
      area?: {
        name: string;
        floor?: string | null;
      } | null;
    } | null;
    assignedTo?: {
      name: string;
      email: string;
      role: string;
    } | null;
    createdBy?: {
      name: string;
      email: string;
      role: string;
    } | null;
    tasks: PdfTask[];
  };
}

function formatDate(value?: Date | string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('es-CO');
}

function safe(value?: string | number | null) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return String(value);
}

function addSectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(1.1);
  doc
    .fontSize(12)
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .text(title, { underline: false });

  doc
    .moveTo(42, doc.y + 4)
    .lineTo(555, doc.y + 4)
    .strokeColor('#cbd5e1')
    .stroke();
  doc.moveDown(0.6);
}

function addKeyValue(
  doc: PDFKit.PDFDocument,
  label: string,
  value?: string | number | null,
) {
  const startX = 50;
  const startY = doc.y;

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#334155')
    .text(`${label}:`, startX, startY, {
      width: 180,
      align: 'left',
    });

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#0f172a')
    .text(safe(value), startX + 190, startY, {
      width: 300,
      align: 'left',
    });

  doc.moveDown(0.4);
}

function addParagraph(
  doc: PDFKit.PDFDocument,
  label: string,
  value?: string | null,
) {
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#334155').text(`${label}:`);

  doc.moveDown(0.25);

  doc.font('Helvetica').fontSize(9).fillColor('#0f172a').text(safe(value), {
    width: 500,
    align: 'left',
    lineGap: 2,
  });

  doc.moveDown(0.8);
}

function addChecklistItem(
  doc: PDFKit.PDFDocument,
  index: number,
  task: PdfTask,
) {
  const mark = task.isCompleted ? '✓' : '○';
  const title = `${index}. ${mark} ${task.title}`;

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#0f172a')
    .text(title, { indent: 8 });

  if (task.description) {
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#475569')
      .text(`   ${task.description}`, {
        indent: 16,
        lineGap: 1.4,
      });
  }

  doc.moveDown(0.3);
}

export async function buildMaintenanceOrderPdf({
  order,
}: BuildMaintenanceOrderPdfParams) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      bufferPages: true,
      info: {
        Title: `Orden de mantenimiento ${order.code}`,
        Author: 'Vitatech',
        Subject: 'Hoja imprimible de mantenimiento',
      },
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(0, 0, doc.page.width, 78).fill('#0f172a');
    doc
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(18)
      .text('Vitatech', 40, 24);
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#cbd5e1')
      .text('Hoja institucional de orden de mantenimiento', 40, 49);
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#ffffff')
      .text(order.code, 420, 27, {
        width: 135,
        align: 'right',
      });

    doc.y = 100;
    doc
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('Orden de mantenimiento biomédica', 42, 90);
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#475569')
      .text(`Emitida el ${formatDate(order.createdAt)}`, 42, 107);

    addSectionTitle(doc, '1. Datos generales');
    addKeyValue(doc, 'Código', order.code);
    addKeyValue(doc, 'Tipo', order.type);
    addKeyValue(doc, 'Estado', order.status);
    addKeyValue(doc, 'Fecha programada', formatDate(order.scheduledDate));
    addKeyValue(doc, 'Inicio', formatDate(order.startedAt));
    addKeyValue(doc, 'Finalización', formatDate(order.completedAt));
    addKeyValue(doc, 'Creación', formatDate(order.createdAt));

    addSectionTitle(doc, '2. Equipo');
    addKeyValue(doc, 'Código interno', order.equipment?.internalCode);
    addKeyValue(doc, 'Nombre', order.equipment?.name);
    addKeyValue(doc, 'Marca', order.equipment?.brand);
    addKeyValue(doc, 'Modelo', order.equipment?.model);
    addKeyValue(doc, 'Serial', order.equipment?.serialNumber);
    addKeyValue(doc, 'Tipo equipo', order.equipment?.equipmentType);
    addKeyValue(doc, 'Riesgo', order.equipment?.riskLevel);
    addKeyValue(doc, 'Estado actual', order.equipment?.status);

    addSectionTitle(doc, '3. Ubicación');
    addKeyValue(doc, 'Empresa', order.equipment?.company?.name);
    addKeyValue(doc, 'NIT', order.equipment?.company?.nit);
    addKeyValue(doc, 'Sede', order.equipment?.site?.name);
    addKeyValue(doc, 'Ciudad', order.equipment?.site?.city);
    addKeyValue(doc, 'Área', order.equipment?.area?.name);
    addKeyValue(doc, 'Piso', order.equipment?.area?.floor);

    addSectionTitle(doc, '4. Responsables');
    addKeyValue(doc, 'Técnico asignado', order.assignedTo?.name);
    addKeyValue(doc, 'Email técnico', order.assignedTo?.email);
    addKeyValue(doc, 'Creado por', order.createdBy?.name);
    addKeyValue(doc, 'Email creador', order.createdBy?.email);

    addSectionTitle(doc, '5. Descripción');
    addParagraph(doc, 'Descripción inicial', order.description);

    addSectionTitle(doc, '6. Checklist');
    if (order.tasks.length === 0) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#64748b')
        .text('Esta orden no tiene tareas registradas.');
    } else {
      order.tasks.forEach((task, index) => {
        addChecklistItem(doc, index + 1, task);
      });
    }

    addSectionTitle(doc, '7. Cierre técnico');
    addParagraph(doc, 'Diagnóstico', order.diagnosis);
    addParagraph(doc, 'Acciones realizadas', order.actionsPerformed);
    addParagraph(doc, 'Recomendaciones', order.recommendations);
    addKeyValue(doc, 'Estado final del equipo', order.finalEquipmentStatus);

    addSectionTitle(doc, '8. Firmas');
    doc.moveDown(0.8);
    doc.moveTo(48, doc.y).lineTo(250, doc.y).strokeColor('#0f172a').stroke();
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#334155')
      .text('Firma técnico responsable', 48, doc.y + 7);

    doc
      .moveTo(320, doc.y - 7)
      .lineTo(552, doc.y - 7)
      .strokeColor('#0f172a')
      .stroke();
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#334155')
      .text('Firma recibido / responsable área', 320, doc.y + 7);

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i += 1) {
      doc.switchToPage(i);
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#64748b')
        .text(
          `Página ${i + 1} de ${range.count} - Generado por Vitatech`,
          40,
          doc.page.height - 32,
          {
            width: doc.page.width - 80,
            align: 'center',
          },
        );
    }

    doc.end();
  });
}
