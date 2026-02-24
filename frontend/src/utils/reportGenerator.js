import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // 1. Import the default export

export const generatePDF = (userData, riskData) => {
  const doc = new jsPDF();
  
  // 2. This is the magic line that fixes your error:
  // It manually attaches autoTable to the document instance if it didn't happen automatically
  
  const date = new Date().toLocaleString();

  // 1. Header & Title
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text("CVD Risk Assessment Report", 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${date}`, 105, 28, { align: 'center' });
  doc.line(20, 32, 190, 32);

  // 2. Risk Summary Section
  doc.setFontSize(14);
  doc.text("Risk Summary", 20, 45);
  
  // 3. Call autoTable directly as a function instead of doc.autoTable
  autoTable(doc, {
    startY: 50,
    head: [['Assessment Item', 'Result']],
    body: [
      ['Risk Level', riskData.status.toUpperCase()],
      ['Probability Score', `${riskData.risk_score}%`],
      ['Recommendation', riskData.recommendation]
    ],
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] }
  });

  // 3. Health Metrics Section
  // Note: we use doc.lastAutoTable to find where the previous table ended
  doc.text("Provided Health Metrics", 20, doc.lastAutoTable.finalY + 15);
  
  const metricsData = Object.entries(userData).map(([key, value]) => [
    key.toUpperCase(), 
    String(value)
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Metric', 'Value']],
    body: metricsData,
    theme: 'grid'
  });

  // 4. Footer
  const finalY = doc.lastAutoTable.finalY + 30;
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("Disclaimer: This is an normal assessment and not a clinical diagnosis.", 20, finalY);

  // Save the PDF
  doc.save(`CVD_Report_${date.split(',')[0]}.pdf`);
};