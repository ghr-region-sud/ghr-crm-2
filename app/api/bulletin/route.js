import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { effectiveDelegateId } from "../../../lib/authz";
import { buildBulletinPdf } from "../../../lib/bulletin-pdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req) {
  const auth = await effectiveDelegateId();
  if (auth.error) {
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: auth.status || 401 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.company || !body?.membership) {
    return NextResponse.json(
      { error: "Données du bulletin incomplètes" },
      { status: 400 }
    );
  }

  if (auth.delegateId && body.company.ownerId !== auth.delegateId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const reference = await fs.readFile(
      path.join(process.cwd(), "public", "bulletin", "bulletin-preview-reference.pdf")
    );

    const bytes = await buildBulletinPdf(
      reference,
      body.company,
      body.membership,
      body.contact || {}
    );

    const safeName =
      String(body.company.name || "GHR")
        .replace(/[^a-z0-9_-]+/gi, "-")
        .replace(/^-+|-+$/g, "") || "GHR";

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Bulletin-adhesion-${safeName}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[bulletin] generation failed", error);
    return NextResponse.json(
      { error: error?.message || "Impossible de générer le bulletin" },
      { status: 500 }
    );
  }
}
