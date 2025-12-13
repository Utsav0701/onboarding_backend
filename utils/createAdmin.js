import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "shahutsav352003@gmail.com";
    const plainPassword = "123";

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await Admin.create({
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin created successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
