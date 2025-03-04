import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const db = await connectToDatabase();

    // Fetch user from "users" collection
    const user = await db.collection("register_user").findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    // Insert user into "project_managers" collection
    await db.collection("project_managers").insertOne(user);

    // Remove user from "users" collection
    await db.collection("register_user").deleteOne({ email });

    return NextResponse.json({
      success: true,
      message: "User assigned as Project Manager",
    });
  } catch (error) {
    console.error("❌ Error assigning project manager:", error);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}
