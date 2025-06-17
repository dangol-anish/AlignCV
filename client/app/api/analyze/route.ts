import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("[API ROUTE] /api/analyze HIT");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { success: false, message: "Server configuration error" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const contentType = request.headers.get("content-type") || "";
  let backendRes;
  try {
    if (contentType.includes("multipart/form-data")) {
      // Forward form data
      const formData = await request.formData();
      backendRes = await fetch(`${apiUrl}/api/analyze`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
        },
        body: formData,
      });
    } else {
      // Forward JSON
      const body = await request.text();
      backendRes = await fetch(`${apiUrl}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body,
      });
    }
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("[API ROUTE] /api/analyze error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}
