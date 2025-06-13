import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log("\n=== CLIENT API: GET COVER LETTER ===");
  console.log("Request params:", params);

  const authHeader = request.headers.get("authorization");
  console.log("Auth header:", authHeader);

  if (!authHeader) {
    console.log("No authorization header found");
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

  try {
    console.log(
      "Making request to:",
      `${apiUrl}/api/cover-letter/${params.id}`
    );
    const response = await fetch(`${apiUrl}/api/cover-letter/${params.id}`, {
      headers: {
        Authorization: authHeader,
      },
    });

    console.log("Server response status:", response.status);
    const data = await response.json();
    console.log("Server response data:", data);

    if (!response.ok) {
      console.log("Error response from server:", data);
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch cover letter",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in client API route:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
