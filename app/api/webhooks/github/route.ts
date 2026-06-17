import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        const body = await req.json();
        const event = req.headers.get("x-github-event");
        if(event === "ping"){
            return NextResponse.json({message: "Pong"}, {status: 200})
        }

        // TODO : HANDLE LATER
        console.log("Recieve github event", event);
        return NextResponse.json({message: "Event Processed"}, {status: 200});
    } catch (error) {

        console.error("Error Processing Webhook",error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
        
    }
}