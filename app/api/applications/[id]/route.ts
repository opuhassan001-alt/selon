import { NextResponse } from "next/server";
import { platformStore } from "@/lib/store";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appId = parseInt(params.id, 10);
    if (isNaN(appId)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

    const body = await request.json();
    const { action, customSlug, adminNotes } = body;

    if (action === "approve") {
      const result = platformStore.approveSalon(appId, customSlug);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      return NextResponse.json(result);
    }

    if (action === "approve_pending") {
      const result = platformStore.approvePendingSalon(appId);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      return NextResponse.json(result);
    }

    if (action === "reject") {
      const result = platformStore.rejectApplication(appId, adminNotes);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appId = parseInt(params.id, 10);
    if (isNaN(appId)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

    const result = platformStore.deleteApplication(appId);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}

