import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_URL is not defined");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    const response = await fetch(`${apiUrl}/api/cover-letter`, {
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Server error response:", {
        status: response.status,
        data,
      });
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch cover letters",
          error: data.error,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    const err = error as Error;
    console.error("Error in fetching cover letters:", {
      message: err.message,
      stack: err.stack,
    });
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to the server",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}
