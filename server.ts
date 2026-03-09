import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Email transporter setup
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // API Route: Generate and send PDF receipt
  app.post('/api/receipts/send', async (req, res) => {
    try {
      const { worker, eventType, laat, payment, receiptId } = req.body;

      if (!worker || !worker.email) {
        return res.status(400).json({ error: 'Worker email is required' });
      }

      // Generate PDF in memory
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      
      doc.on('data', buffers.push.bind(buffers));
      
      // PDF Content
      doc.fontSize(20).text('JS APPARELS', { align: 'center' });
      doc.fontSize(12).text('(Kids Wear Manufacturer)', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text('Work Receipt', { align: 'center', underline: true });
      doc.moveDown();

      doc.fontSize(12).text(`Receipt ID: ${receiptId}`);
      doc.text(`Date & Time: ${new Date().toLocaleString()}`);
      doc.text(`Status: ${eventType}`);
      doc.moveDown();

      doc.fontSize(14).text('Worker Information', { underline: true });
      doc.fontSize(12).text(`Name: ${worker.name}`);
      doc.text(`Worker ID: ${worker.worker_id}`);
      doc.text(`City: ${worker.city}`);
      doc.text(`Mobile: ${worker.mobile}`);
      doc.moveDown();

      if (laat) {
        doc.fontSize(14).text('Work Information (Laat)', { underline: true });
        doc.fontSize(12).text(`Laat Number: ${laat.laat_number}`);
        doc.text(`Item Label: ${laat.label}`);
        doc.text(`Piece Size: ${laat.piece_size}`);
        doc.text(`Price Per Piece: Rs. ${laat.price_per_piece}`);
        if (laat.total_items_stitched) {
          doc.text(`Total Items Stitched: ${laat.total_items_stitched}`);
          doc.text(`Total Earned: Rs. ${laat.total_earned}`);
        }
        doc.moveDown();
      }

      if (payment) {
        doc.fontSize(14).text('Payment Information', { underline: true });
        doc.fontSize(12).text(`Total Payment: Rs. ${payment.total_payment}`);
        doc.text(`Payment Received: Rs. ${payment.received_payment}`);
        doc.text(`Remaining Balance: Rs. ${payment.remaining_payment}`);
        doc.moveDown();
      }

      doc.end();

      const pdfBuffer = await new Promise<Buffer>((resolve) => {
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });
      });

      // Send Email
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail({
          from: `"JS APPARELS" <${process.env.SMTP_USER}>`,
          to: worker.email,
          subject: 'JS APPARELS Work Receipt',
          text: `Dear ${worker.name},\n\nYour work activity has been recorded successfully. Please find the attached PDF receipt for your record.\n\nThank you for working with JS APPARELS.`,
          attachments: [
            {
              filename: `Receipt_${receiptId}.pdf`,
              content: pdfBuffer,
            },
          ],
        });
      } else {
        console.warn('SMTP credentials not configured. Email not sent, but PDF generated.');
      }

      res.json({ success: true, message: 'Receipt generated and sent successfully' });
    } catch (error) {
      console.error('Error generating/sending receipt:', error);
      res.status(500).json({ error: 'Failed to generate and send receipt' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
