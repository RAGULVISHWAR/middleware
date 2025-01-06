
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken'

export async function POST(req:NextRequest){
  
    const header = req.headers.get("authorization");
    if(!header || !header.startsWith('Bearer'))
     {
       return NextResponse.json({message:"Unauthorize access"},{status:403});
     }

    const token =header.split(' ')[1];
    try{
        jwt.verify(token,process.env.SECRET_KEY || 'ragul'); 
        return NextResponse.json({message:'Accepted'},{status:202});  
     }
    catch(err){
        console.error("Token verification error:", err);
        return NextResponse.json({ message: "Invalid or expired token" },{ status: 401 })

    }
}