import { NextResponse } from "next/server";
import { getRsvPizzaEvent, RSV_PIZZA_PUBLIC_URL } from "@/src/lib/rsv-pizza";

export const runtime = "nodejs";

export async function GET() {
  const event = await getRsvPizzaEvent();
  if (!event) {
    return NextResponse.json(
      { event: null, publicUrl: RSV_PIZZA_PUBLIC_URL, error: "upstream_unavailable" },
      { status: 200 },
    );
  }
  return NextResponse.json({
    event: {
      name: event.name,
      date: event.date,
      timezone: event.timezone,
      venueName: event.venueName,
      address: event.address,
      eventImageUrl: event.eventImageUrl,
      description: event.description,
      hostName: event.hostName,
      guestCount: event.guestCount,
      coHosts: event.coHosts.map((c) => ({
        name: c.name,
        avatar_url: c.avatar_url ?? null,
        website: c.website ?? null,
        twitter: c.twitter ?? null,
        instagram: c.instagram ?? null,
      })),
      rsvpClosedAt: event.rsvpClosedAt,
      availableToppings: event.availableToppings ?? [],
      availableBeverages: event.availableBeverages ?? [],
      pizzaStyle: event.pizzaStyle ?? null,
    },
    publicUrl: RSV_PIZZA_PUBLIC_URL,
  });
}
