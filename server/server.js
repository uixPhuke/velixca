const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

const discountRoutes = require("./routers/discountRoutes.js"); // Use require

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/discounts", discountRoutes);

const PORT = process.env.PORT 
const URL=process.env.MONGO_URL

mongoose
    .connect(URL)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
