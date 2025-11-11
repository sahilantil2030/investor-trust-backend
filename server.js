// server.js
const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");

const app = express();

app.use(cors()); // Sabhi domains se request allow karega
app.use(express.json()); // Naye express mein body-parser ki jagah

// Server test karne ke liye ek "Welcome" route
app.get("/", (req, res) => {
  res.send("Investor Trust Backend Server is running!");
});

// Asli payment order banane ka route
app.post("/api/create-order", async (req, res) => {
  try {
    // Apni keys Vercel se uthao (Yahaan directly mat daalna)
    const KEY_ID = process.env.RAZORPAY_KEY_ID;
    const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    const razorpay = new Razorpay({
      key_id: KEY_ID,
      key_secret: KEY_SECRET,
    });

    const amountInRupees = req.body.amount;
    const amountInPaise = amountInRupees * 100; // Razorpay paise mein amount leta hai

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    // Razorpay se order create karein
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).send("Error creating order");
    }

    // Order ID aur amount wapas frontend ko bhej do
    res.json({
      id: order.id,
      amount_in_paise: order.amount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Vercel ko batane ke liye ki server ready hai
module.exports = app;
