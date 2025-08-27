import nodemailer from "nodemailer";

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "freshsouls69@gmail.com",
        pass: "hlzo tcfv gefi siza",
    },
});

// Send email notification
export const sendEmailNotification = async (toEmail, subject, message) => {
    try {
        const info = await transporter.sendMail({
            from: '"JobX Admin" <freshsouls69@gmail.com>',
            to: toEmail,
            subject: subject,
            text: message,
            html: `<p>${message}</p>`,
        });
        console.log(`Email sent to ${toEmail}: ${subject} (Message ID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Email notification error for ${toEmail}:`, error);
        return { success: false, error: error.message };
    }
};