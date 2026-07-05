import { buildMaintenanceOrderPdf } from './reports-pdf.util';

describe('buildMaintenanceOrderPdf', () => {
  it('generates a printable PDF with an institutional layout for the order', async () => {
    const pdf = await buildMaintenanceOrderPdf({
      order: {
        code: 'ORD-001',
        type: 'PREVENTIVE',
        status: 'PENDING',
        scheduledDate: '2026-07-10T08:00:00.000Z',
        createdAt: '2026-07-01T08:00:00.000Z',
        description: 'Inspección preventiva de bomba de infusión.',
        diagnosis: 'Sin hallazgos críticos.',
        actionsPerformed: 'Se revisó el equipo.',
        recommendations: 'Mantener control mensual.',
        finalEquipmentStatus: 'ACTIVE',
        equipment: {
          internalCode: 'EQ-100',
          name: 'Bomba de Infusión',
          brand: 'B Braun',
          model: 'Infusomat',
          serialNumber: 'SN-001',
          equipmentType: 'Infusion pump',
          riskLevel: 'ALTA',
          status: 'ACTIVE',
          company: { name: 'Clínica Metropolitana', nit: '900123456' },
          site: { name: 'Sede Norte', city: 'Bogotá' },
          area: { name: 'UTI', floor: '2' },
        },
        assignedTo: { name: 'Carlos Díaz', email: 'carlos@vitatech.local', role: 'TECHNICIAN' },
        createdBy: { name: 'Ana Ríos', email: 'ana@vitatech.local', role: 'ADMIN' },
        tasks: [
          { title: 'Verificar filtros', description: 'Confirmar estado', isCompleted: true },
          { title: 'Limpiar superficie', description: 'Aplicar protocolo', isCompleted: false },
        ],
      },
    });

    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.length).toBeGreaterThan(1000);
    const content = pdf.toString('latin1').toLowerCase();
    expect(content).toContain('%pdf');
    expect(content).toContain('/title');
    expect(content).toContain('orden de mantenimiento ord-001');
    expect(content).toContain('/author');
  });
});
