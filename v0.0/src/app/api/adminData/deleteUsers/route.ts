import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

export async function DELETE(req: Request) {
  try {
    const { emails } = await req.json();

    if (!emails || emails.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No emails provided for deletion",
      });
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("team_manager_db");
    const collection = db.collection("register_user");

    // Delete users from the database
    const result = await collection.deleteMany({ email: { $in: emails } });

    await client.close();

    if (result.deletedCount > 0) {
      return NextResponse.json({
        success: true,
        message: `${result.deletedCount} users deleted successfully.`,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "No users found with provided emails.",
      });
    }
  } catch (error) {
    console.error("Error deleting users:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete users.",
    });
  }
}
