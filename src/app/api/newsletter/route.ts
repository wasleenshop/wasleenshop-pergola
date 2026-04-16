/**
 * app/api/newsletter/route.ts
 *
 * POST endpoint to subscribe an email to the Klaviyo newsletter list.
 * Called by the Newsletter component on the homepage.
 *
 * Uses Klaviyo REST API v3 (revision 2024-10-15).
 * The private key stays server-side — never exposed to the client.
 */

import { NextRequest, NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body?.email?.trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const privateKey = process.env.KLAVIYO_PRIVATE_KEY;
    if (!privateKey) {
      console.error("[Newsletter] KLAVIYO_PRIVATE_KEY is not configured.");
      return NextResponse.json(
        { error: "Service temporarily unavailable." },
        { status: 503 }
      );
    }

    // Optional: subscribe to a specific list if the env var is set
    const listId = process.env.KLAVIYO_NEWSLETTER_LIST_ID;

    const payload: Record<string, unknown> = {
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          profiles: {
            data: [
              {
                type: "profile",
                attributes: {
                  email,
                  subscriptions: {
                    email: {
                      marketing: { consent: "SUBSCRIBED" },
                    },
                  },
                  properties: {
                    source: "homepage_newsletter",
                  },
                },
              },
            ],
          },
          ...(listId
            ? { list: { data: { type: "list", id: listId } } }
            : {}),
        },
      },
    };

    const response = await fetch(
      "https://a.klaviyo.com/api/profile-subscriptions-bulk-create-jobs/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Klaviyo-API-Key ${privateKey}`,
          revision: "2024-10-15",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "unknown");
      console.error(
        `[Newsletter] Klaviyo error ${response.status}:`,
        errorText
      );
      return NextResponse.json(
        { error: "Subscription failed. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Newsletter] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
