// src/lib/paypal.ts
const base =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// cache the OAuth token so we don't fetch it on every request
let cachedToken: { token: string; expMs: number } | null = null;

function b64(s: string) {
  return Buffer.from(s).toString("base64");
}

export async function getPaypalAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expMs > now + 10_000) {
    return cachedToken.token;
  }

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${b64(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
      )}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const json = await res.json().catch(() => ({} as any));
  if (!res.ok) {
    console.error("paypal_oauth_failed", res.status, json);
    throw new Error(`paypal_oauth_failed:${res.status}`);
  }

  const token = (json as any).access_token as string;
  const expiresIn = (json as any).expires_in as number | undefined;
  cachedToken = {
    token,
    expMs: Date.now() + (expiresIn ? expiresIn * 1000 : 3000 * 1000),
  };
  return token;
}

export async function paypalCreateOrder(
  body: any,
  requestId?: string
): Promise<any> {
  const token = await getPaypalAccessToken();
  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "Prefer": "return=representation",
      ...(requestId ? { "PayPal-Request-Id": requestId } : {}),
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!res.ok) {
    console.error("paypal_create_error", res.status, data);
    throw new Error(`paypal_create_failed:${res.status}`);
  }
  return data;
}

export async function paypalCaptureOrder(orderId: string): Promise<any> {
  const token = await getPaypalAccessToken();
  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
  });

  const json = await res.json().catch(() => ({} as any));
  if (!res.ok) {
    console.error("paypal_capture_error", res.status, json);
    throw new Error(`paypal_capture_failed:${res.status}`);
  }
  return json;
}
