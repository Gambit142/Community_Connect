const { Parser } = require('json2csv');
const XLSX = require('xlsx');
const pdfMake = require('pdfmake/build/pdfmake'); // No vfs_fonts needed
const path = require('path'); 
const fs = require('fs'); // For reading font files

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
      // Define absolute paths to fonts (from controller location: src/controllers/admin/)
      const fontsDir = path.join(__dirname, '../../../fonts'); // Back to server root
      const normalPath = path.join(fontsDir, 'Roboto-Regular.ttf');
      const boldPath = path.join(fontsDir, 'Roboto-Medium.ttf');
      const italicsPath = path.join(fontsDir, 'Roboto-Italic.ttf');

      // Load fonts as base64 into virtual file system (VFS)
      const vfs_fonts = {};
      try {
        vfs_fonts['Roboto-Regular.ttf'] = fs.readFileSync(normalPath, { encoding: 'base64' });
        vfs_fonts['Roboto-Medium.ttf'] = fs.readFileSync(boldPath, { encoding: 'base64' });
        vfs_fonts['Roboto-Italic.ttf'] = fs.readFileSync(italicsPath, { encoding: 'base64' });
        pdfMake.vfs = vfs_fonts; // Set the VFS for pdfMake
        console.log('✅ Fonts loaded into VFS successfully');
      } catch (fontError) {
        console.error('❌ Font loading error:', fontError.message);
        return res.status(500).json({ message: 'Failed to load fonts for PDF generation. Ensure font files exist in /server/fonts/' });
      }

      const docDefinition = {
        // Define fonts referencing the VFS filenames (not paths)
        fonts: {
          Roboto: {
            normal: 'Roboto-Regular.ttf',
            bold: 'Roboto-Medium.ttf',
            italics: 'Roboto-Italic.ttf'
          }
        },
        content: [
          { text: 'CommunityConnect Analytics Report', font: 'Roboto', bold: true, fontSize: 18, margin: [0, 0, 0, 10] },
          { text: `Generated on: ${new Date().toLocaleDateString()}`, font: 'Roboto', italics: true, fontSize: 12, margin: [0, 5, 0, 15] },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', '*'],
              body: [
                [{ text: 'Metric', font: 'Roboto', bold: true }, { text: 'Value', font: 'Roboto', bold: true }, { text: 'Description', font: 'Roboto', bold: true }],
                ...exportData.map(row => [row.Metric, row.Value, row.Description])
              ]
            },
            layout: {
              fillColor: function (rowIndex) {
                return rowIndex === 0 ? '#f3f4f6' : null;
              },
              hLineWidth: function (i, node) {
                return i === 0 || i === node.table.body.length ? 0.5 : 0.25;
              },
              vLineWidth: function (i, node) {
                return 0.25;
              },
              hLineColor: function (i, node) {
                return '#e5e7eb';
              },
              vLineColor: function (i, node) {
                return '#e5e7eb';
              }
            }
          }
        ],
        defaultStyle: {
          font: 'Roboto'
        },
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 40]
      };
      const pdfDoc = pdfMake.createPdf(docDefinition);
      buffer = await new Promise((resolve, reject) => {
        pdfDoc.getBuffer((buf) => {
          if (buf) resolve(buf);
          else reject(new Error('Failed to generate PDF buffer'));
        });
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