const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, 
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // Professional Medical Theme HTML Template
    const htmlMessage = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { margin: 0; padding: 0; background-color: #f4f7f9; }
            .container { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .header { background-color: #1a3a5f; color: #ffffff; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; text-transform: uppercase; }
            .header p { margin: 5px 0 0; font-size: 14px; opacity: 0.8; }
            .content { padding: 40px 30px; line-height: 1.8; color: #2c3e50; }
            .content h2 { color: #1a3a5f; font-size: 20px; margin-top: 0; }
            .button-container { text-align: center; margin: 35px 0; }
            .button { background-color: #0056b3; color: #ffffff !important; padding: 15px 35px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; transition: background-color 0.3s ease; }
            .footer { background-color: #f8f9fa; color: #95a5a6; padding: 25px; text-align: center; font-size: 12px; border-top: 1px solid #edf2f7; }
            .security-note { color: #e74c3c; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Lakany Pain Clinic</h1>
                <p>Advanced Pain Management & Care</p>
            </div>
            <div class="content">
                <h2>${options.subject}</h2>
                <p>Dear Patient,</p>
                <p>${options.messageBody}</p>
                
                ${options.resetURL ? `
                <div class="button-container">
                    <a href="${options.resetURL}" class="button">Reset Password</a>
                </div>
                <p style="font-size: 13px; color: #7f8c8d;">If you're having trouble clicking the button, copy and paste the link below into your web browser:</p>
                <p style="font-size: 12px; color: #0056b3; word-break: break-all;">${options.resetURL}</p>
                ` : ''}

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 13px;">If you did not make this request, please <span class="security-note">ignore this email</span> or contact our clinic immediately if you have concerns about your account security.</p>
                <p>Warm regards,<br><strong>Administration Team</strong><br>Lakany Pain Clinic</p>
            </div>
            <div class="footer">
                <p>This is an automated message, please do not reply directly to this email.</p>
                <p>&copy; ${new Date().getFullYear()} Lakany Pain Clinic. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"Lakany Pain Clinic" <${process.env.EMAIL_USERNAME}>`,
        to: options.email,
        subject: options.subject,
        html: htmlMessage,
        text: options.messageBody 
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;