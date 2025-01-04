import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";


export  async function POST(req: NextRequest) {
        console.log('error',process.env.NEXT_PUBLIC_ADMIN_EMAIL); 
         
    try{     
        
        const body = await req.json();
        const {email,password}=body;
        if(email && password)
        {
             if(email === "ragulvishwa42@gmail.com" && password === "1223")
             {
                const token = jwt.sign({email,role:"admin"},process.env.NEXT_PUBLIC_SECRET_KEY || "ragul" ,{expiresIn:'1m'});
                return NextResponse.json({token},{status:200});
             }
        }
        else
        {
            return NextResponse.json({message:"invalid"},{status:400});
        }
    }
    catch
    {
        return NextResponse.json({message:"Forbidden"},{status:403});
    }
    
      
}
