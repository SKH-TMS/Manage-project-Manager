import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const db = client.db("team_manager_db");
    const users = await db.collection("register_user").find({}).toArray();

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch users.",
    });
  } finally {
    await client.close();
  }
}
