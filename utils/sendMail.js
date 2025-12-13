import nodemailer from "nodemailer";

export const sendMail = async (to, subject, html, userid) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,                // ✅ MUST be 587 (not 465)
      secure: false,            // ✅ false for STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password
      },
      tls: {
        rejectUnauthorized: false, // ✅ IMPORTANT for Render
      },
      connectionTimeout: 10000, // 10 sec
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const mailOptions = {
      from: `"Onboarding App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;

  } catch (error) {
    console.error("Send mail error:", error);
    throw error;
  }
};
