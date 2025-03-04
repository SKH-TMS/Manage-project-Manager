import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function PUT(req: Request) {
  try {
    const { users } = await req.json(); // Extract users from request body

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No users provided for update.",
      });
    }

    await client.connect();
    const db = client.db("team_manager_db");
    const collection = db.collection("register_user");

    let updateCount = 0;

    for (const user of users) {
      const { email, firstName, lastName, contact } = user;

      const updateResult = await collection.updateOne(
        { email },
        { $set: { firstName, lastName, contact } }
      );

      if (updateResult.modifiedCount > 0) {
        updateCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updateCount} user(s) updated successfully.`,
    });
  } catch (error) {
    console.error("❌ Error updating users:", error);
    return NextResponse.json({
      success: false,
      message: "Error updating users.",
    });
  } finally {
    await client.close();
  }
}
