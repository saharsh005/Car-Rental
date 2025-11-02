import nodemailer from "nodemailer";
import twilio from "twilio";

export const sendNotifications = async (req, res) => {
  const { email, phoneNumber, car, pickupDate, returnDate, totalCost } = req.body;

  try {
    // ✉️ 1. Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Rent-A-Ride" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Booking is Confirmed!",
      html: `
        <h3>Booking Confirmed ✅</h3>
        <p>Thank you for booking with Rent-A-Ride!</p>
        <ul>
          <li><b>Car:</b> ${car.brand} ${car.model}</li>
          <li><b>Pickup:</b> ${pickupDate}</li>
          <li><b>Return:</b> ${returnDate}</li>
          <li><b>Total:</b> ₹${totalCost}</li>
        </ul>
        <p>We wish you a safe and pleasant journey! 🚗</p>
      `,
    });

    // 📱 2. Send SMS
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    await client.messages.create({
      body: `Your Rent-A-Ride booking is confirmed! ${car.brand} ${car.model}, Pickup: ${pickupDate}, Return: ${returnDate}. Total: ₹${totalCost}.`,
      from: process.env.TWILIO_PHONE,
      to: `+91${phoneNumber}`,
    });

    res.status(200).json({ success: true, message: "Email & SMS sent successfully!" });
  } catch (error) {
    console.error("Notification Error:", error);
    res.status(500).json({ success: false, message: "Failed to send notifications" });
  }
};
