
const sendEmail = async ({ to, subject, text }) => {
  try {
    const response = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        secret: process.env.GOOGLE_APPS_SCRIPT_SECRET,
        to,
        subject,
        text,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("Google Apps Script email error:", result);
      throw new Error("Email could not be sent");
    }

    return result;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
