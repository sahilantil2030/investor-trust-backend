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
    // Apni keys Vercel se uthao
    const KEY_ID = process.env.RAZORPAY_KEY_ID;
    const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    
    // Check karein ki keys Vercel se mili ya nahi
    if (!KEY_ID || !KEY_SECRET) {
      throw new Error("Razorpay Keys Vercel par set nahi hain.");
    }

    const razorpay = new Razorpay({
      key_id: KEY_ID,
      key_secret: KEY_SECRET,
    });

    const amountInRupees = req.body.amount;
    const amountInPaise = amountInRupees * 100;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    // Razorpay se order create karein
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ error: true, message: "Error creating order" });
    }

    // Order ID aur amount wapas frontend ko bhej do
    res.json({
      id: order.id,
      amount_in_paise: order.amount,
    });

  } catch (error) {
    console.error("SERVER CRASH ERROR:", error.message); // Server par asli error log karein
    
    // <<< --- YEH HAI NAYA UPDATE --- >>>
    // Frontend ko plain text "Server Error" ki jagah JSON error bhejein
    res.status(500).json({ 
        error: true, 
        message: "Server par Razorpay se connect nahi ho paa raha hai. Check karein ki Live Keys active hain." 
    });
  }
});

// Vercel ko batane ke liye ki server ready hai
module.exports = app;
