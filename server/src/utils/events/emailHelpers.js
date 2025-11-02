const nodemailer = require('nodemailer');

// Nodemailer transporter (shared)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true, // Enable for verbose logs
  logger: true, // Log to console
});

const sendConfirmationEmail = async (user, event, order) => {
  const confirmationNumber = `CC-${order._id.toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`; // Fixed: toString()
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Registration Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #05213C; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background: #f9f9f9; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #05213C; color: white; }
        .footer { text-align: center; padding: 20px; font-size: 14px; color: #666; }
        .confirmation-badge { background: #4CAF50; color: white; padding: 5px 10px; border-radius: 20px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Registration Confirmed!</h1>
      </div>
      <div class="content">
        <p>Dear <strong>${user.username}</strong>,</p>
        <p>Your registration for the following event has been confirmed. Thank you for joining us!</p>
        <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #05213C;">Event Details</h2>
          <table>
            <tr><th>Event Title</th><td>${event.title}</td></tr>
            <tr><th>Date</th><td>${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
            <tr><th>Time</th><td>${event.time}</td></tr>
            <tr><th>Location</th><td>${event.location}</td></tr>
            <tr><th>Category</th><td>${event.category}</td></tr>
            <tr><th>Number of Tickets</th><td>${order.tickets}</td></tr>
            ${order.specialRequests ? `<tr><th>Special Requests</th><td>${order.specialRequests}</td></tr>` : ''}
            <tr><th>Total Amount</th><td>Free</td></tr>
          </table>
          <div style="text-align: center; margin: 20px 0;">
            <span class="confirmation-badge">Confirmation #${confirmationNumber}</span>
          </div>
        </div>
        <p>If you have any questions, please don't hesitate to contact us.</p>
      </div>
      <div class="footer">
        <p>Best regards,<br>The Community Connect Team</p>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Community Connect" <${process.env.EMAIL_USER}>`, // Fixed: Proper from field
      to: user.email,
      subject: `Registration Confirmed: ${event.title}`,
      html: htmlContent,
    });
    console.log(`Confirmation email sent successfully to ${user.email} (Message ID: ${info.messageId})`);
  } catch (emailError) {
    console.error('Failed to send confirmation email to', user.email, ':', emailError.message);
    // Optional: Log full error for debug
    console.error('Full email error:', emailError);
  }
};

const sendReceiptEmail = async (user, event, order) => {
  const confirmationNumber = `CC-${order._id.toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`; // Fixed: toString()
  const paymentMethodDisplay = order.paymentMethod || 'Stripe';
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Registration Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #05213C; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background: #f9f9f9; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #05213C; color: white; }
        .total { font-size: 1.2em; font-weight: bold; color: #05213C; }
        .footer { text-align: center; padding: 20px; font-size: 14px; color: #666; }
        .confirmation-badge { background: #2196F3; color: white; padding: 5px 10px; border-radius: 20px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Payment Receipt</h1>
      </div>
      <div class="content">
        <p>Dear <strong>${user.username}</strong>,</p>
        <p>Thank you for your payment. Your registration for the following event is confirmed.</p>
        <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #05213C;">Event & Payment Details</h2>
          <table>
            <tr><th>Event Title</th><td>${event.title}</td></tr>
            <tr><th>Date</th><td>${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
            <tr><th>Time</th><td>${event.time}</td></tr>
            <tr><th>Location</th><td>${event.location}</td></tr>
            <tr><th>Category</th><td>${event.category}</td></tr>
            <tr><th>Number of Tickets</th><td>${order.tickets}</td></tr>
            ${order.specialRequests ? `<tr><th>Special Requests</th><td>${order.specialRequests}</td></tr>` : ''}
            <tr><th>Payment Method</th><td>${paymentMethodDisplay}</td></tr>
            <tr><th>Order Date</th><td>${new Date(order.createdAt).toLocaleDateString()}</td></tr>
            <tr><th class="total">Total Paid</th><td class="total">$${order.amount.toFixed(2)}</td></tr>
          </table>
          <div style="text-align: center; margin: 20px 0;">
            <span class="confirmation-badge">Receipt #${confirmationNumber}</span>
          </div>
        </div>
        <p>This serves as your official receipt. Please keep for your records.</p>
      </div>
      <div class="footer">
        <p>Best regards,<br>The Community Connect Team</p>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Community Connect" <${process.env.EMAIL_USER}>`, // Fixed: Proper from field
      to: user.email,
      subject: `Receipt: Registration for ${event.title}`,
      html: htmlContent,
    });
    console.log(`Receipt email sent successfully to ${user.email} (Message ID: ${info.messageId})`);
  } catch (emailError) {
    console.error('Failed to send receipt email to', user.email, ':', emailError.message);
    // Optional: Log full error for debug
    console.error('Full email error:', emailError);
  }
};

module.exports = { sendConfirmationEmail, sendReceiptEmail };