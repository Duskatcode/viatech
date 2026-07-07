import * as ExcelJS from 'exceljs';

type ReportCellValue = string | number | null | undefined;

export interface ReportExcelColumn {
  header: string;
  key: string;
  width?: number;
}

interface BuildReportWorkbookParams {
  sheetName: string;
  title: string;
  subtitle?: string;
  columns: ReportExcelColumn[];
  rows: Array<Record<string, ReportCellValue>>;
}

export async function buildReportWorkbook({
  sheetName,
  title,
  subtitle,
  columns,
  rows,
}: BuildReportWorkbookParams) {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'Vitatech Maintenance Platform';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet(sheetName);

  const lastColumn = columns.length;

  worksheet.mergeCells(1, 1, 1, lastColumn);
  worksheet.getCell(1, 1).value = title;
  worksheet.getCell(1, 1).font = {
    bold: true,
    size: 16,
    color: { argb: 'FFFFFFFF' },
  };
  worksheet.getCell(1, 1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' },
  };
  worksheet.getCell(1, 1).alignment = {
    vertical: 'middle',
    horizontal: 'left',
  };

  worksheet.mergeCells(2, 1, 2, lastColumn);
  worksheet.getCell(2, 1).value =
    subtitle ?? `Generado: ${new Date().toISOString()}`;
  worksheet.getCell(2, 1).font = {
    size: 11,
    color: { argb: 'FF475569' },
  };

  worksheet.addRow([]);

  const headerRowNumber = 4;
  const headerRow = worksheet.getRow(headerRowNumber);

  columns.forEach((column, index) => {
    const cell = headerRow.getCell(index + 1);

    cell.value = column.header;
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0891B2' },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF0E7490' } },
      left: { style: 'thin', color: { argb: 'FF0E7490' } },
      bottom: { style: 'thin', color: { argb: 'FF0E7490' } },
      right: { style: 'thin', color: { argb: 'FF0E7490' } },
    };

    worksheet.getColumn(index + 1).width = column.width ?? 20;
  });

  rows.forEach((row) => {
    const dataRow = worksheet.addRow(
      columns.map((column) => row[column.key] ?? ''),
    );

    dataRow.eachCell((cell) => {
      cell.alignment = {
        vertical: 'top',
        wrapText: true,
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  worksheet.views = [
    {
      state: 'frozen',
      ySplit: headerRowNumber,
    },
  ];

  worksheet.autoFilter = {
    from: {
      row: headerRowNumber,
      column: 1,
    },
    to: {
      row: headerRowNumber,
      column: lastColumn,
    },
  };

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer as ArrayBuffer);
}
