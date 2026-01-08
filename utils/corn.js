import cron from "node-cron";
import assessmentModel from "../Models/assesmentModel.js";

cron.schedule("*/5 * * * *", async () => {
  try {
    const result = await assessmentModel.updateMany(
      {
        endDateTime: { $lt: new Date() },
        status: true
      },
      {
        $set: { status: false }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`⏰ ${result.modifiedCount} assessment(s) expired & disabled`);
    }
  } catch (error) {
    console.error("Cron error:", error.message);
  }
});
