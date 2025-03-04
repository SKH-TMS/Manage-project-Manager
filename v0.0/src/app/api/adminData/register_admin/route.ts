import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { generateToken, setToken } from "../../../../utils/token";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, contact, userType } =
      await req.json();

    // Connect to MongoDB
    await client.connect();
    const db = client.db("team_manager_db");
    const collection = db.collection("register_Admin");

    // Check if user already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    // Default profile picture
    const profilePic = "/default-profile.png";

    // Insert new user into database
    const result = await collection.insertOne({
      firstName,
      lastName,
      email,
      password: hashedPassword, // Store the hashed password
      contact: contact || "", // Optional field
      profilePic,
      userType: "Admin",
    });

    // Generate JWT token
    const token = generateToken({
      email,
      firstName,
      lastName,
      profilePic,
      contact,
      userType: "Admin",
    });

    // Set the token as an HttpOnly cookie
    const res = NextResponse.json({
      success: true,
      message: "Registration successful",
    });
    setToken(res, token);

    return res;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ success: false, message: "Failed to register" });
  } finally {
    await client.close();
  }
}
