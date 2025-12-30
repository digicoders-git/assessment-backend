import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import amdidnModel from "../Models/adminModel.js";

dotenv.config();

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const adminExists = await amdidnModel.findOne();
  if (adminExists) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await amdidnModel.create({
    userName: "Admin",
    password: hashedPassword
  });

  console.log("Admin created successfully");
  process.exit(0);
};

createAdmin();
