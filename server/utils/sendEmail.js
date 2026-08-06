// import nodemailer from "nodemailer";

// const sendEmail = async ({ to, subject, html }) => {
//     const transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST,
//         port: process.env.SMTP_PORT,
//         auth: {
//             user: process.env.SMTP_USER,
//             pass: process.env.SMTP_PASS,
//         },
//     });

//     await transporter.sendMail({
//         from: `"E-Commerce Store" <${process.env.SMTP_USER}>`,
//         to,
//         subject,
//         html,
//     });
// };

// export default sendEmail;

import 'dotenv/config.js';
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth:{

        user: process.env.EMAIL,
        pass:process.env.EMAIL_PASSWORD

    }
});

export default transporter;