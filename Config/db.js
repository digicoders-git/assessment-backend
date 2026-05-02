import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // Enable allowDiskUse globally for all aggregations
    mongoose.set('allowDiskUse', true);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(`db error ${error.message}`);
  }
};
export default dbConnect;