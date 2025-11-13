const { Parser } = require('json2csv');
const XLSX = require('xlsx');
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const User = require('../../models/User.js');
const Post = require('../../models/Post.js');
const Event = require('../../models/Event.js');
const Comment = require('../../models/Comment.js');
const Order = require('../../models/Order.js');

const exportAnalytics = async (req, res) => {
  try {
    const { format } = req.body; // Expect { format: 'csv' | 'pdf' | 'xlsx' }
    if (!['csv', 'pdf', 'xlsx'].includes(format)) {
      return res.status(400).json({ message: 'Invalid export format' });
    }

    // Fetch data (reuse logic from analyticsController)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Metrics (simplified for export)
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ updatedAt: { $gte: thirtyDaysAgo } });
    const totalPosts = await Post.countDocuments({ status: 'Published' });
    const totalEvents = await Event.countDocuments({ status: 'Published' });
    const eventParticipation = (await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$tickets' } } }
    ]))[0]?.total || 0;
    const flaggedComments = await Comment.countDocuments({ flags: { $exists: true, $ne: [] }, deleted: false });

    // Prepare export data as array of objects
    const exportData = [
      { Metric: 'Total Users', Value: totalUsers, Description: 'Registered users' },
      { Metric: 'Active Users (30 days)', Value: activeUsers, Description: 'Last 30 days' },
      { Metric: 'Total Posts', Value: totalPosts, Description: 'Published posts' },
      { Metric: 'Total Events', Value: totalEvents, Description: 'Published events' },
      { Metric: 'Event Participation', Value: eventParticipation, Description: 'Total tickets sold' },
      { Metric: 'Flagged Comments', Value: flaggedComments, Description: 'Requiring review' },
    ];

    let buffer;
    let filename;

    if (format === 'csv') {
      const fields = ['Metric', 'Value', 'Description'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(exportData);
      buffer = Buffer.from(csv, 'utf8');
      filename = 'analytics-report.csv';
      res.setHeader('Content-Type', 'text/csv');
    } else if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Analytics Report');
      buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      filename = 'analytics-report.xlsx';
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } else if (format === 'pdf') {
      const docDefinition = {
        content: [
          { text: 'CommunityConnect Analytics Report', style: 'header' },
          { text: `Generated on: ${new Date().toLocaleDateString()}`, style: 'subheader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', '*'],
              body: [
                ['Metric', 'Value', 'Description'],
                ...exportData.map(row => [row.Metric, row.Value, row.Description])
              ]
            },
            layout: 'lightHorizontalLines'
          }
        ],
        styles: {
          header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
          subheader: { fontSize: 12, italics: true, margin: [0, 5, 0, 15] }
        }
      };
      const pdfDoc = pdfMake.createPdf(docDefinition);
      buffer = await new Promise((resolve) => {
        pdfDoc.getBuffer((buf) => resolve(buf));
      });
      filename = 'analytics-report.pdf';
      res.setHeader('Content-Type', 'application/pdf');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to generate export file' });
  }
};

module.exports = { exportAnalytics };