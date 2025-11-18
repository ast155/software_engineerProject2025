import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    // basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email and password are required" },
        { status: 400 }
      );
    }

    // check if user already exists
    const existing = await User.findOne({ email });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email is already used" },
        { status: 400 }
      );
    }

    // create new user
    const newUser = await User.create({ name, email, password });

    return NextResponse.json(
      {
        success: true,
        message: "Signup successful",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          image: newUser.image || "",
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

