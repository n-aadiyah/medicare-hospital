const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text }) => {
  const { data, error } = await resend.emails.send({
    from: "MediCare <onboarding@resend.dev>",
    to,
    subject,
    text,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error("Email could not be sent");
  }

  return data;
};

module.exports = sendEmail;