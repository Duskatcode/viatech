import PDFDocument = require('pdfkit');

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
  doc.moveDown(1);
  doc
    .fontSize(13)
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .text(title);

  doc
    .moveTo(doc.x, doc.y + 4)
    .lineTo(555, doc.y + 4)
    .strokeColor('#cbd5e1')
    .stroke();

  doc.moveDown(0.8);
}

function addKeyValue(
  doc: PDFKit.PDFDocument,
  label: string,
  value?: string | number | null,
) {
  const startX = doc.x;
  const startY = doc.y;

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#334155')
    .text(`${label}:`, startX, startY, {
      width: 130,
      continued: false,
    });

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#0f172a')
    .text(safe(value), startX + 135, startY, {
      width: 360,
    });

  doc.moveDown(0.4);
}

function addParagraph(
  doc: PDFKit.PDFDocument,
  label: string,
  value?: string | null,
) {
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#334155')
    .text(label);

  doc.moveDown(0.2);

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#0f172a')
    .text(safe(value), {
      width: 500,
      align: 'left',
    });

  doc.moveDown(0.8);
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
        Author: 'Biomed Maintenance Platform',
        Subject: 'Hoja imprimible de mantenimiento',
      },
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc
      .rect(0, 0, doc.page.width, 78)
      .fill('#0f172a');

    doc
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(18)
      .text('Biomed Maintenance Platform', 40, 24);

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#cbd5e1')
      .text('Hoja imprimible de orden de mantenimiento', 40, 49);

    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#ffffff')
      .text(order.code, 410, 27, {
        width: 145,
        align: 'right',
      });

    doc.y = 100;

    addSectionTitle(doc, '1. Datos generales de la orden');
    addKeyValue(doc, 'Codigo', order.code);
    addKeyValue(doc, 'Tipo', order.type);
    addKeyValue(doc, 'Estado', order.status);
    addKeyValue(doc, 'Fecha programada', formatDate(order.scheduledDate));
    addKeyValue(doc, 'Inicio', formatDate(order.startedAt));
    addKeyValue(doc, 'Finalizacion', formatDate(order.completedAt));
    addKeyValue(doc, 'Creacion', formatDate(order.createdAt));

    addSectionTitle(doc, '2. Equipo');
    addKeyValue(doc, 'Codigo interno', order.equipment?.internalCode);
    addKeyValue(doc, 'Nombre', order.equipment?.name);
    addKeyValue(doc, 'Marca', order.equipment?.brand);
    addKeyValue(doc, 'Modelo', order.equipment?.model);
    addKeyValue(doc, 'Serial', order.equipment?.serialNumber);
    addKeyValue(doc, 'Tipo equipo', order.equipment?.equipmentType);
    addKeyValue(doc, 'Riesgo', order.equipment?.riskLevel);
    addKeyValue(doc, 'Estado actual', order.equipment?.status);

    addSectionTitle(doc, '3. Ubicacion');
    addKeyValue(doc, 'Empresa', order.equipment?.company?.name);
    addKeyValue(doc, 'NIT', order.equipment?.company?.nit);
    addKeyValue(doc, 'Sede', order.equipment?.site?.name);
    addKeyValue(doc, 'Ciudad', order.equipment?.site?.city);
    addKeyValue(doc, 'Area', order.equipment?.area?.name);
    addKeyValue(doc, 'Piso', order.equipment?.area?.floor);

    addSectionTitle(doc, '4. Responsables');
    addKeyValue(doc, 'Tecnico asignado', order.assignedTo?.name);
    addKeyValue(doc, 'Email tecnico', order.assignedTo?.email);
    addKeyValue(doc, 'Creado por', order.createdBy?.name);
    addKeyValue(doc, 'Email creador', order.createdBy?.email);

    addSectionTitle(doc, '5. Descripcion');
    addParagraph(doc, 'Descripcion inicial', order.description);

    addSectionTitle(doc, '6. Checklist');
    if (order.tasks.length === 0) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#64748b')
        .text('Esta orden no tiene tareas registradas.');
    } else {
      order.tasks.forEach((task, index) => {
        const mark = task.isCompleted ? '[x]' : '[ ]';

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#0f172a')
          .text(`${index + 1}. ${mark} ${task.title}`);

        if (task.description) {
          doc
            .font('Helvetica')
            .fontSize(8)
            .fillColor('#475569')
            .text(task.description, {
              indent: 18,
            });
        }

        doc.moveDown(0.35);
      });
    }

    addSectionTitle(doc, '7. Cierre tecnico');
    addParagraph(doc, 'Diagnostico', order.diagnosis);
    addParagraph(doc, 'Acciones realizadas', order.actionsPerformed);
    addParagraph(doc, 'Recomendaciones', order.recommendations);
    addKeyValue(doc, 'Estado final del equipo', order.finalEquipmentStatus);

    addSectionTitle(doc, '8. Firma');
    doc.moveDown(1.5);
    doc
      .moveTo(40, doc.y)
      .lineTo(260, doc.y)
      .strokeColor('#0f172a')
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#334155')
      .text('Firma tecnico responsable', 40, doc.y + 6);

    doc
      .moveTo(330, doc.y - 6)
      .lineTo(555, doc.y - 6)
      .strokeColor('#0f172a')
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#334155')
      .text('Firma recibido / responsable area', 330, doc.y + 6);

    const range = doc.bufferedPageRange();

    for (let i = range.start; i < range.start + range.count; i += 1) {
      doc.switchToPage(i);
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#64748b')
        .text(
          `Pagina ${i + 1} de ${range.count} - Generado por Biomed Maintenance Platform`,
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
