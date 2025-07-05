import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: string) {
  switch (status) {
    case "متوفر":
      return "bg-green-100 text-green-800";
    case "في الطريق":
      return "bg-amber-100 text-amber-800";
    case "قيد الصيانة":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(data: any[], filename: string) {
  if (!data.length) return;
  
  // Import XLSX dynamically
  import('xlsx').then((XLSX) => {
    // Prepare data with Arabic headers
    const arabicHeaders = {
      'id': 'المعرف',
      'manufacturer': 'الصانع',
      'category': 'الفئة',
      'engineCapacity': 'سعة المحرك',
      'year': 'السنة',
      'exteriorColor': 'اللون الخارجي',
      'interiorColor': 'اللون الداخلي',
      'status': 'الحالة',
      'importType': 'نوع الاستيراد',
      'location': 'الموقع',
      'chassisNumber': 'رقم الهيكل',
      'price': 'السعر',
      'entryDate': 'تاريخ الدخول',
      'isSold': 'مباع',
      'soldDate': 'تاريخ البيع',
      'notes': 'ملاحظات'
    };

    // Transform data with Arabic headers
    const transformedData = data.map(item => {
      const transformedItem: any = {};
      Object.entries(item).forEach(([key, value]) => {
        const arabicKey = arabicHeaders[key as keyof typeof arabicHeaders] || key;
        
        // Format dates
        if (key === 'entryDate' || key === 'soldDate') {
          transformedItem[arabicKey] = value ? new Date(value as string).toLocaleDateString('ar-SA') : '';
        }
        // Format boolean values
        else if (key === 'isSold') {
          transformedItem[arabicKey] = value ? 'نعم' : 'لا';
        }
        // Format arrays (images)
        else if (Array.isArray(value)) {
          transformedItem[arabicKey] = value.length > 0 ? value.join(', ') : '';
        }
        else {
          transformedItem[arabicKey] = value || '';
        }
      });
      return transformedItem;
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(transformedData);

    // Set column widths for better display
    const colWidths = [
      { wch: 10 }, // المعرف
      { wch: 15 }, // الصانع
      { wch: 15 }, // الفئة
      { wch: 15 }, // سعة المحرك
      { wch: 10 }, // السنة
      { wch: 15 }, // اللون الخارجي
      { wch: 15 }, // اللون الداخلي
      { wch: 12 }, // الحالة
      { wch: 15 }, // نوع الاستيراد
      { wch: 15 }, // الموقع
      { wch: 20 }, // رقم الهيكل
      { wch: 12 }, // السعر
      { wch: 15 }, // تاريخ الدخول
      { wch: 10 }, // مباع
      { wch: 15 }, // تاريخ البيع
      { wch: 25 }  // ملاحظات
    ];
    ws['!cols'] = colWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'المخزون');

    // Generate Excel file and download
    XLSX.writeFile(wb, filename.replace('.csv', '.xlsx'));
  }).catch(error => {
    console.error('Error importing XLSX library:', error);
    // Fallback to CSV if XLSX fails
    exportToCSV(data, filename);
  });
}

export function printTable() {
  // Get the table element
  const tableElement = document.querySelector('[data-table="inventory-table"]');
  
  if (!tableElement) {
    console.error('Table not found for printing');
    return;
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // Create print content with Arabic RTL styling
  const printContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>طباعة جدول المخزون</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Noto Sans Arabic', sans-serif;
          direction: rtl;
          text-align: right;
          padding: 20px;
          background: white;
        }
        
        .print-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        
        .print-header h1 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
        }
        
        .print-date {
          font-size: 12px;
          color: #666;
          margin-bottom: 20px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin-bottom: 20px;
        }
        
        th, td {
          border: 1px solid #333;
          padding: 8px;
          text-align: right;
        }
        
        th {
          background-color: #f5f5f5;
          font-weight: bold;
          font-size: 11px;
        }
        
        td {
          font-size: 10px;
        }
        
        .status-available { color: #16a34a; font-weight: bold; }
        .status-transit { color: #d97706; font-weight: bold; }
        .status-maintenance { color: #dc2626; font-weight: bold; }
        .status-sold { color: #dc2626; font-weight: bold; background-color: #fef2f2; }
        
        @media print {
          body { margin: 0; }
          .print-header { page-break-after: avoid; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>جدول المخزون</h1>
        <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleDateString('en-US')}</div>
      </div>
      <div class="table-container">
        ${tableElement.outerHTML}
      </div>
    </body>
    </html>
  `;

  // Write content and print
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}
