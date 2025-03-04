import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Ensure only one MongoDB client is used globally
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
    const { emails } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid email list provided." },
        { status: 400 }
      );
    }

    // Get database connection
    const db = await getDatabase();
    const usersCollection = db.collection("register_user");

    // Fetch users matching the provided emails
    const users = await usersCollection
      .find({ email: { $in: emails } })
      .toArray();

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("❌ Error fetching users by email:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users by email." },
      { status: 500 }
    );
  }
}
