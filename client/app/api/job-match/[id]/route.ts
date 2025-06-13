import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log("[Client API] Fetching job match for ID:", params.id);
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      console.log("[Client API] No authorization header found");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error("[Client API] NEXT_PUBLIC_API_URL is not defined");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log(
      "[Client API] Making request to:",
      `${apiUrl}/api/job-matching/${params.id}`
    );
    const response = await fetch(`${apiUrl}/api/job-matching/${params.id}`, {
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await response.json();
    console.log("[Client API] Server response:", {
      status: response.status,
      data,
    });

    if (!response.ok) {
      console.error("[Client API] Server error response:", {
        status: response.status,
        data,
      });
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch job match",
          error: data.error,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Client API] Error in job match route:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to the server",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
