import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = global._mongoClientPromise;
}

async function getDatabase() {
  const client = await clientPromise;
  return client.db("team_manager_db");
}

export async function POST(req: Request) {
  try {
    console.log("📸 Profile picture upload started...");

    // Extract uploaded file and user email
    const formData = await req.formData();
    const file = formData.get("profilePic") as File | null;
    const emailRaw = formData.get("email"); // Might be FormDataEntryValue

    // Ensure email is a string before using trim()
    const email =
      typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : null;

    if (!file) {
      console.error("❌ No file received");
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }
    if (!email) {
      console.error("❌ No email received or invalid email format");
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Ensure the uploads directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate a unique filename for each user (overwrite old file)
    const fileExtension = path.extname(file.name);
    const fileName = `profile-User-${email.replace(
      /[@.]/g,
      "_"
    )}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    const fileUrl = `/uploads/${fileName}`;

    // Read the file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the file (overwrite previous profile picture)
    await writeFile(filePath, buffer);
    console.log(`✅ File uploaded successfully: ${filePath}`);

    // Update MongoDB user profile
    const db = await getDatabase();
    const collection = db.collection("register_user");

    const updateResult = await collection.updateOne(
      { email },
      { $set: { profilePic: fileUrl } },
      { upsert: false }
    );

    if (updateResult.matchedCount === 0) {
      console.error(`❌ User with email "${email}" not found in MongoDB.`);
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (updateResult.modifiedCount === 0) {
      console.warn(
        `⚠️ Profile picture already set to the same value: ${fileUrl}`
      );
    } else {
      console.log(`✅ Profile picture updated in database: ${fileUrl}`);
    }

    return NextResponse.json({ success: true, profilePicUrl: fileUrl });
  } catch (error) {
    console.error("❌ Error updating profile picture:", error);
    return NextResponse.json(
      { success: false, message: "Profile picture update failed" },
      { status: 500 }
    );
  }
}
