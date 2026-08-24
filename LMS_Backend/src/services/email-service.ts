// import fs from "fs/promises";
// import nodemailer from "nodemailer";
// import { MailOptions } from "nodemailer/lib/json-transport";
// import dotenv from "dotenv";

// dotenv.config();
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });


// export async function sendEmail(options: {
//     to: string;
//     subject: string;
//     html: string;
// }) {
//     const mailOptions: MailOptions = {
//         from: process.env.EMAIL_USER,
//         ...options,
//     };
//     const info = await transporter.sendMail(mailOptions);

//     console.log("email sent to ", info.accepted);
// }

// async function sendEmailVerificationLink(email: string, token: string) {
//     const url = `http://localhost:3000/api/auth/verify/${email}/${token}`;

//     let emailTemplate = await fs.readFile(
//         // "./src/templates/email.template.html",
//         "./src/services/templates/register.html",
//         "utf-8"
//     );

//     emailTemplate = emailTemplate.replace("{url}", url);

//     await sendEmail({
//         to: email,
//         subject: "Email verification",
//         html: emailTemplate,
//     });
// }
// async function sendGoogleWelcomeEmail(email: string, name: string) {
//     let emailTemplate = await fs.readFile(
//         "./src/services/templates/continue-W-google.html",
//         "utf-8"
//     );

//     emailTemplate = emailTemplate.replace("{name}", name);

//     await sendEmail({
//         to: email,
//         subject: "Welcome to M-commerce 👋",
//         html: emailTemplate,
//     });
// }

// export const emailService = {
//     sendEmail,
//     sendEmailVerificationLink,
//     sendGoogleWelcomeEmail
// };
