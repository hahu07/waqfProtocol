// components/waqf/ReportModal.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Waqf } from '@/types/waqfs';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Dialog, DialogTitle } from '@headlessui/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialReport } from './FinancialReport';
import { ImpactReport } from './ImpactReport';
import { ContributionsReport } from './ContributionsReport';

type ReportType = 'financial' | 'impact' | 'contributions';
const REPORT_TYPES: ReportType[] = ['financial', 'impact', 'contributions'];

interface PDFExportOptions {
  waqf: Waqf;
  reportType: ReportType;
  watermarkText?: string;
  signatureRequired?: boolean;
}

const exportToPDF = (options: PDFExportOptions): Promise<void> => {
  const { waqf, reportType, watermarkText = 'CONFIDENTIAL', signatureRequired = false } = options;
  
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();
      const date = new Date().toLocaleDateString();

      // PDF configuration
      autoTable(doc, {
        styles: {
          fillColor: [139, 92, 246], // Purple-500
          textColor: [255, 255, 255],
          fontSize: 10,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [126, 34, 206], // Purple-700 (darker for header)
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [250, 245, 255] // Very light purple tint
        },
        margin: { top: 45 },
      });

      // Header with solid purple
      doc.setFillColor(147, 51, 234); // Purple-600
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text('Waqf Protocol', 14, 15);
      
      // Watermark
      doc.setFontSize(40);
      doc.setTextColor(230, 230, 230);
      doc.text(watermarkText, 40, 150, { angle: 45 });
      doc.setTextColor(0, 0, 0);

      // Report title
      doc.setFontSize(18);
      doc.text(`Waqf Report - ${waqf.data.donor.name}`, 14, 35);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 40, 190, 40);

      // Report content
      switch(reportType) {
        case 'financial':
          doc.text('Financial Summary', 14, 50);
          autoTable(doc, {
            startY: 55,
            head: [['Metric', 'Value']],
            body: [
              ['Total Donations', formatCurrency(waqf.data.financial.totalDonations)],
              ['Total Distributed', formatCurrency(waqf.data.financial.totalDistributed)],
              ['Current Balance', formatCurrency(waqf.data.financial.currentBalance)],
              ['Investment Returns', formatCurrency(waqf.data.financial.totalInvestmentReturn)],
              ['Completion Rate', waqf.data.financial.impactMetrics?.completionRate ? `${Math.round(waqf.data.financial.impactMetrics.completionRate * 100)}%` : 'N/A']
            ],
          });
          break;
        case 'impact':
          doc.text('Impact Summary', 14, 50);
          autoTable(doc, {
            startY: 55,
            head: [['Metric', 'Value']],
            body: [
              ['Causes Supported', waqf.data.supportedCauses.length.toString()],
              ['Beneficiaries Reached', waqf.data.financial.impactMetrics?.beneficiariesSupported?.toLocaleString() || 'N/A'],
              ['Projects Funded', waqf.data.financial.impactMetrics?.projectsCompleted?.toString() || 'N/A'],
              ['Completion Rate', waqf.data.financial.impactMetrics?.completionRate ? `${Math.round(waqf.data.financial.impactMetrics.completionRate * 100)}%` : 'N/A']
            ],
          });
          break;
        case 'contributions':
          doc.text('Contribution History', 14, 50);
          autoTable(doc, {
            startY: 55,
            head: [['Date', 'Amount', 'Status']],
            body: waqf.data.waqfAssets.map(donation => [
              formatDate(donation.date),
              formatCurrency(donation.amount),
              donation.status
            ]),
          });
          break;
      }

      if (signatureRequired) {
        doc.setFontSize(12);
        doc.text('Authorized Signature:', 14, 260);
        doc.line(60, 260, 120, 260);
      }

      doc.save(`waqf-report-${waqf.data.donor.name}-${date}.pdf`);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

interface ReportModalProps {
  waqf: Waqf | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export const ReportModal = ({ waqf, isOpen, onClose, isLoading = false }: ReportModalProps) => {
  const [reportType, setReportType] = useState<ReportType>('financial');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [touchActive, setTouchActive] = useState(false);
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  const handleExportPDF = async () => {
    const isMobile = window.innerWidth < 640;
    if (!waqf) return;
    
    setIsGeneratingPDF(true);
    setPdfError(null);
    
    try {
      await exportToPDF({
        waqf,
        reportType,
       watermarkText: isMobile ? '' : 'CONFIDENTIAL',
      signatureRequired: !isMobile && reportType === 'financial'
      });
    } catch (error) {
      setPdfError(error instanceof Error ? error.message : 'PDF generation failed');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
        <div className="relative w-full max-w-full sm:max-w-md md:max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all">
          {pdfError && (
            <div className="p-3 text-xs bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 sm:text-sm sm:p-4 flex items-start gap-3" role="alert">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="flex-1">{pdfError}</span>
            </div>
          )}

          <div className="p-4 space-y-4 sm:p-6 sm:space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <DialogTitle as="h2" className="text-lg font-bold text-gray-900 dark:text-white sm:text-2xl">
                  {isLoading ? 'Loading Report...' : `${waqf?.data.donor.name || 'Waqf'} Report`}
                </DialogTitle>
              </div>
              <button
                ref={initialFocusRef}
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:rotate-90"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-3">
              {REPORT_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setReportType(type)}
                  className={`px-4 py-2.5 text-sm font-semibold capitalize rounded-xl transition-all duration-300 sm:text-base sm:px-6 sm:py-3 relative overflow-hidden group
                    ${reportType === type 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 scale-105' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-800 dark:text-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700'}
                    hover:scale-105 active:scale-95`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {reportType === type && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {type}
                  </span>
                  {reportType === type && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  )}
                </button>
              ))}
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 sm:p-6 min-h-[300px] border border-gray-200 dark:border-gray-700">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Loading report data...</p>
                </div>
              ) : waqf ? (
                <div className="space-y-4">
                  {reportType === 'financial' && <FinancialReport waqf={waqf} />}
                  {reportType === 'impact' && <ImpactReport waqf={waqf} />}
                  {reportType === 'contributions' && <ContributionsReport waqf={waqf} />}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-500 dark:text-red-400 font-semibold">Failed to load waqf data</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Please try again later</p>
                </div>
              )}
            </div>

            <button
              onClick={handleExportPDF}
              onTouchStart={() => setTouchActive(true)}
              onTouchEnd={() => setTouchActive(false)}
              disabled={isGeneratingPDF || !waqf}
              className={`w-full py-3 sm:py-4 text-sm font-bold rounded-xl sm:text-base transition-all duration-300 shadow-lg relative overflow-hidden group
                ${isGeneratingPDF || !waqf
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-500/50 hover:shadow-xl hover:scale-105'}
                ${touchActive ? 'scale-95' : ''}`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isGeneratingPDF ? (
                  <>
                    <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export Report as PDF</span>
                  </>
                )}
              </span>
              {!isGeneratingPDF && !(!waqf) && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};