import mongoose from "mongoose";
import dotenv from "dotenv";
import collegeModel from "../Models/collegeModel.js";

dotenv.config();

async function addCollege() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const collegeName = "ITM Maharajganj";
  const location = "Maharajganj";

  let college = await collegeModel.findOne({
    collegeName: new RegExp("^" + collegeName + "$", "i")
  });

  if (!college) {
    college = await collegeModel.create({
      collegeName,
      location
    });
    console.log("College added successfully:", college.collegeName, "ID:", college._id);
  } else {
    console.log("College already exists:", college.collegeName, "ID:", college._id);
  }

  await mongoose.disconnect();
}

addCollege().catch(err => {
  console.error("Error adding college:", err);
  mongoose.disconnect();
  process.exit(1);
});

