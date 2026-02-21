import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

/**
 * Export Service
 * Handles data export to various formats (CSV, PDF, JSON)
 */

class ExportService {
    /**
     * Convert data to CSV format
     */
    toCSV(data, fields = null) {
        try {
            const opts = fields ? { fields } : {};
            const parser = new Parser(opts);
            const csv = parser.parse(data);
            return csv;
        } catch (error) {
            throw new Error(`CSV export failed: ${error.message}`);
        }
    }

    /**
     * Generate PDF report
     */
    async toPDF(data, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Add title
                if (options.title) {
                    doc.fontSize(20).text(options.title, { align: 'center' });
                    doc.moveDown();
                }

                // Add metadata
                if (options.metadata) {
                    doc.fontSize(10);
                    Object.keys(options.metadata).forEach(key => {
                        doc.text(`${key}: ${options.metadata[key]}`);
                    });
                    doc.moveDown();
                }

                // Add data table
                if (Array.isArray(data) && data.length > 0) {
                    doc.fontSize(12);

                    // Add headers
                    const headers = options.headers || Object.keys(data[0]);
                    const columnWidth = (doc.page.width - 100) / headers.length;

                    let y = doc.y;
                    headers.forEach((header, i) => {
                        doc.text(header, 50 + (i * columnWidth), y, {
                            width: columnWidth,
                            continued: i < headers.length - 1
                        });
                    });
                    doc.moveDown();

                    // Add rows
                    doc.fontSize(10);
                    data.forEach((row, rowIndex) => {
                        if (doc.y > doc.page.height - 100) {
                            doc.addPage();
                        }

                        y = doc.y;
                        headers.forEach((header, i) => {
                            const value = row[header] !== undefined ? String(row[header]) : '';
                            doc.text(value, 50 + (i * columnWidth), y, {
                                width: columnWidth,
                                continued: i < headers.length - 1
                            });
                        });
                        doc.moveDown(0.5);
                    });
                }

                // Add footer
                const pages = doc.bufferedPageRange();
                for (let i = 0; i < pages.count; i++) {
                    doc.switchToPage(i);
                    doc.fontSize(8).text(
                        `Page ${i + 1} of ${pages.count}`,
                        50,
                        doc.page.height - 50,
                        { align: 'center' }
                    );
                }

                doc.end();
            } catch (error) {
                reject(new Error(`PDF export failed: ${error.message}`));
            }
        });
    }

    /**
     * Export leads data
     */
    async exportLeads(leads, format = 'csv') {
        const formattedData = leads.map(lead => ({
            'Customer Name': lead.customerName,
            'Phone': lead.customerPhone,
            'Email': lead.customerEmail || 'N/A',
            'Status': lead.status,
            'Priority': lead.priority,
            'Assigned To': lead.assignedTo?.name || 'Unassigned',
            'Payment Status': lead.paymentStatus || 'N/A',
            'Payment Amount': lead.paymentAmount || 0,
            'Created Date': new Date(lead.createdAt).toLocaleDateString(),
            'Last Updated': new Date(lead.updatedAt).toLocaleDateString()
        }));

        if (format === 'csv') {
            return this.toCSV(formattedData);
        } else if (format === 'pdf') {
            return this.toPDF(formattedData, {
                title: 'Leads Report',
                metadata: {
                    'Generated On': new Date().toLocaleString(),
                    'Total Records': leads.length
                }
            });
        } else {
            return JSON.stringify(formattedData, null, 2);
        }
    }

    /**
     * Export referrals data
     */
    async exportReferrals(referrals, format = 'csv') {
        const formattedData = referrals.map(ref => ({
            'Advocate': ref.advocate?.name || 'Unknown',
            'Customer Name': ref.referredCustomer?.name || ref.referredName,
            'Phone': ref.referredCustomer?.phone || ref.referredPhone,
            'Email': ref.referredCustomer?.email || ref.referredEmail || 'N/A',
            'Status': ref.status,
            'Project': ref.project?.name || 'N/A',
            'Reward Amount': ref.reward?.amount || 0,
            'Reward Status': ref.reward?.status || 'N/A',
            'Created Date': new Date(ref.createdAt).toLocaleDateString()
        }));

        if (format === 'csv') {
            return this.toCSV(formattedData);
        } else if (format === 'pdf') {
            return this.toPDF(formattedData, {
                title: 'Referrals Report',
                metadata: {
                    'Generated On': new Date().toLocaleString(),
                    'Total Records': referrals.length
                }
            });
        } else {
            return JSON.stringify(formattedData, null, 2);
        }
    }

    /**
     * Export analytics report
     */
    async exportAnalytics(analyticsData, format = 'csv', reportType = 'general') {
        let formattedData;
        let title = 'Analytics Report';

        switch (reportType) {
            case 'revenue':
                formattedData = analyticsData.overTime?.map(item => ({
                    'Period': `${item._id.year}-${item._id.month || ''}`,
                    'Total Revenue': item.totalRevenue || 0,
                    'Conversions': item.conversions || 0
                })) || [];
                title = 'Revenue Analytics Report';
                break;

            case 'sales':
                formattedData = analyticsData.topPerformers?.map(item => ({
                    'Sales Person': item.userName,
                    'Total Leads': item.totalLeads,
                    'Converted': item.converted,
                    'Conversion Rate': `${item.conversionRate.toFixed(2)}%`,
                    'Revenue': item.revenue
                })) || [];
                title = 'Sales Performance Report';
                break;

            case 'project':
                formattedData = analyticsData.map(item => ({
                    'Project Name': item.name,
                    'Status': item.status,
                    'Total Customers': item.totalCustomers,
                    'Total Referrals': item.totalReferrals,
                    'Total Leads': item.totalLeads,
                    'Converted Leads': item.convertedLeads,
                    'Conversion Rate': `${item.conversionRate.toFixed(2)}%`,
                    'Revenue': item.revenue
                }));
                title = 'Project Performance Report';
                break;

            case 'roi':
                formattedData = [{
                    'Total Revenue': analyticsData.totalRevenue,
                    'Total Rewards': analyticsData.totalRewards,
                    'Net Profit': analyticsData.netProfit,
                    'ROI': `${analyticsData.roi}%`,
                    'Profit Margin': `${analyticsData.profitMargin}%`,
                    'Conversions': analyticsData.conversions,
                    'Avg Revenue per Conversion': analyticsData.averageRevenuePerConversion
                }];
                title = 'ROI Analysis Report';
                break;

            default:
                formattedData = [analyticsData];
        }

        if (format === 'csv') {
            return this.toCSV(formattedData);
        } else if (format === 'pdf') {
            return this.toPDF(formattedData, {
                title,
                metadata: {
                    'Generated On': new Date().toLocaleString(),
                    'Report Type': reportType
                }
            });
        } else {
            return JSON.stringify(formattedData, null, 2);
        }
    }

    /**
     * Export users data
     */
    async exportUsers(users, format = 'csv') {
        const formattedData = users.map(user => ({
            'Name': user.name,
            'Email': user.email,
            'Phone': user.phone,
            'Role': user.role,
            'Status': user.isActive ? 'Active' : 'Inactive',
            'Project': user.project?.name || 'N/A',
            'Created Date': new Date(user.createdAt).toLocaleDateString()
        }));

        if (format === 'csv') {
            return this.toCSV(formattedData);
        } else if (format === 'pdf') {
            return this.toPDF(formattedData, {
                title: 'Users Report',
                metadata: {
                    'Generated On': new Date().toLocaleString(),
                    'Total Records': users.length
                }
            });
        } else {
            return JSON.stringify(formattedData, null, 2);
        }
    }

    /**
     * Export customers data
     */
    async exportCustomers(customers, format = 'csv') {
        const formattedData = customers.map(customer => ({
            'Name': customer.name,
            'Phone': customer.phone,
            'Email': customer.email || 'N/A',
            'Project': customer.project?.name || 'N/A',
            'Status': customer.status,
            'Referral Code': customer.referralCode,
            'Created Date': new Date(customer.createdAt).toLocaleDateString()
        }));

        if (format === 'csv') {
            return this.toCSV(formattedData);
        } else if (format === 'pdf') {
            return this.toPDF(formattedData, {
                title: 'Customers Report',
                metadata: {
                    'Generated On': new Date().toLocaleString(),
                    'Total Records': customers.length
                }
            });
        } else {
            return JSON.stringify(formattedData, null, 2);
        }
    }

    /**
     * Get appropriate content type for format
     */
    getContentType(format) {
        switch (format) {
            case 'csv':
                return 'text/csv';
            case 'pdf':
                return 'application/pdf';
            case 'json':
                return 'application/json';
            default:
                return 'text/plain';
        }
    }

    /**
     * Get appropriate file extension
     */
    getFileExtension(format) {
        switch (format) {
            case 'csv':
                return '.csv';
            case 'pdf':
                return '.pdf';
            case 'json':
                return '.json';
            default:
                return '.txt';
        }
    }
}

const exportServiceInstance = new ExportService();
export default exportServiceInstance;
