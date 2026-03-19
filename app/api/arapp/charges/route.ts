import { NextResponse } from "next/server";
import { arappCollection, getARAppDropById } from "@/src/lib/arapp-catalog";

const COMMERCE_API_URL = "https://api.commerce.coinbase.com";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spectrart.xyz";

type ChargeRequest = {
  walletAddress?: string | null;
  items?: Array<{ id?: string; quantity?: number }>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChargeRequest;
    const requestedItems = Array.isArray(body.items) ? body.items : [];

    const items = requestedItems
      .map((item) => {
        const drop = item.id ? getARAppDropById(item.id) : undefined;
        const quantity = Math.max(0, Number(item.quantity || 0));
        if (!drop || !quantity) return null;
        return { drop, quantity, lineTotal: drop.priceUsd * quantity };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    if (!items.length) {
      return NextResponse.json({ error: "No valid ARApp items were provided." }, { status: 400 });
    }

    const orderReference = `arapp-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
    const amountUsd = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const description = items.map((item) => `${item.drop.title} x${item.quantity}`).join(", ");
    const previewMessage = `Preview order ready. Reference ${orderReference}. Add COINBASE_COMMERCE_API_KEY to enable live checkout.`;
    const apiKey = process.env.COINBASE_COMMERCE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        previewMode: true,
        orderReference,
        amountUsd,
        message: previewMessage,
      });
    }

    const payload = {
      name: `${arappCollection.title} order`,
      description,
      pricing_type: "fixed_price",
      local_price: {
        amount: amountUsd.toFixed(2),
        currency: "USD",
      },
      metadata: {
        orderReference,
        walletAddress: body.walletAddress || "",
        source: "spectra-arapp",
        items: items.map((item) => ({
          id: item.drop.id,
          title: item.drop.title,
          quantity: item.quantity,
        })),
      },
      redirect_url: `${siteUrl}/arapp?order=${orderReference}`,
      cancel_url: `${siteUrl}/arapp`,
    };

    const response = await fetch(`${COMMERCE_API_URL}/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CC-Api-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Coinbase Commerce charge creation failed: ${errorText}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const charge = data?.data ?? {};

    return NextResponse.json({
      previewMode: false,
      orderReference,
      amountUsd,
      chargeId: charge.id,
      checkoutUrl: charge.hosted_url || charge.redirect_url || "",
      message: `Live checkout created. Reference ${orderReference}.`,
    });
  } catch {
    return NextResponse.json(
      { error: "ARApp order preparation failed." },
      { status: 500 },
    );
  }
}
