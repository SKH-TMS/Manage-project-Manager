import { NextResponse } from "next/server";
import { getToken, verifyToken, GetUserType } from "../../../../utils/token";
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
    const token = getToken(req); // Extract token from cookies

    if (!token) {
      return NextResponse.json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify the token using the verifyToken function
    const decodedUser = verifyToken(token);

    if (!decodedUser) {
      return NextResponse.json({ success: false, message: "Invalid token" });
    }

    const db = await getDatabase();

    // Safely parse the request body to avoid JSON parsing errors
    let requestBody = {};
    try {
      requestBody = await req.json();
    } catch (error) {
      console.warn("⚠️ Warning: No JSON body received in the request.");
    }
    console.log(requestBody);
    const { userType: requestedUserType } = requestBody as {
      userType?: string;
    };
    let user = null;
    let userType = "no"; // Default to User
    const TypeofUser = GetUserType(token);
    //to compare usertype from the token to the usertype from the Request
    if (requestedUserType == TypeofUser) {
      // If userType is explicitly "Admin", fetch from register_Admin
      if (requestedUserType === "Admin") {
        user = await db
          .collection("register_Admin")
          .findOne({ email: decodedUser.email });
        userType = "Admin";
      } else if (requestedUserType === "User") {
        user = await db
          .collection("register_user")
          .findOne({ email: decodedUser.email });
        userType = "User";
      }

      if (!user) {
        console.log("user not found");
        return NextResponse.json({ success: false, message: "User not found" });
      }

      return NextResponse.json({
        success: true,
        message: "Token valid",
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePic: user.profilePic || "/default-profile.png",
          contact: user.contact || "",
          userType, // Distinguish between User and Admin
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "User Type is wrong",
      });
    }
  } catch (error) {
    console.error("❌ Error verifying token:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error verifying token",
      },
      { status: 201 }
    );
  }
}
