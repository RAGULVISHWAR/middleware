import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface AdminInfo {
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
    console.log("email",process.env.ADMIN_EMAIL);
    console.log("pass",process.env.ADMIN_PASSWORD);
  try {
    // Parse JSON body from NextRequest
    const body = await req.json();
    const { email, password }: AdminInfo = body;
    
    // Check if credentials match
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign(
        { email, role: "admin" },
        process.env.SECRET_KEY || "ragul",
        { expiresIn: "30s" }
      );
      return NextResponse.json({ token }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
