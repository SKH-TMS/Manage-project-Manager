import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!; // Store your MongoDB URI in environment variables
let client: MongoClient | null = null;

export const connectToDatabase = async () => {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db();
};
