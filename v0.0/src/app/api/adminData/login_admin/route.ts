import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { generateToken, setToken } from "../../../../utils/token";
import bcrypt from "bcryptjs"; // Import bcrypt for password comparison

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Connect to the MongoDB database
    await client.connect();
    const db = client.db("team_manager_db");
    const collection = db.collection("register_Admin"); // Only check Admin collection

    // Find the admin with the matching email
    const admin = await collection.findOne({ email });

    // If admin is not found or password is incorrect
    if (!admin) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare hashed password with provided password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Ensure profilePic exists, else use default
    const profilePic = admin.profilePic
      ? admin.profilePic
      : "/default-profile.png";

    // Generate JWT token for the admin
    const token = generateToken({
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      profilePic: profilePic,
      contact: admin.contact,
      userType: "Admin",
    });

    const res = NextResponse.json({
      success: true,
      message: "Admin login successful!",
      user: {
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        profilePic: profilePic,
        contact: admin.contact,
        userType: admin.userType,
      },
    });

    // Set the token in the cookie
    setToken(res, token);

    return res;
  } catch (error) {
    console.error("Admin Login Error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to log in as admin. Please try again later.",
    });
  } finally {
    await client.close();
  }
}
