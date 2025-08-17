"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SuccessPage() {
  const [status, setStatus] = useState<null | string>(null);
  const [message, setMessage] = useState<string>("Finalizing your booking…");

  useEffect(() => {
    (async () => {
      const stripe = await stripePromise;
      if (!stripe) return;

      const params = new URLSearchParams(window.location.search);
      const clientSecret = params.get("payment_intent_client_secret");

      if (!clientSecret) {
        setStatus("unknown");
        setMessage("Payment status unknown. If you paid, you’ll get an email shortly.");
        return;
      }

      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

      switch (paymentIntent?.status) {
        case "succeeded":
          setStatus("succeeded");
          setMessage("Payment received. We’re confirming your slot and emailing details.");
          break;
        case "processing":
          setStatus("processing");
          setMessage("Payment processing… We’ll email you once it’s confirmed.");
          break;
        case "requires_payment_method":
          setStatus("failed");
          setMessage("Payment failed or canceled. You can try again.");
          break;
        default:
          setStatus(paymentIntent?.status ?? "unknown");
          setMessage("Payment status: " + (paymentIntent?.status ?? "unknown"));
      }
    })();
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 text-center space-y-4">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <p className="text-white/80">{message}</p>

      <div className="flex gap-2 justify-center">
        {(status === "failed" || status === "requires_payment_method") && (
          <a href="/checkout" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 ring-1 ring-white/15 text-white">
            Try again
          </a>
        )}
        <a href="/sessions/vod-review" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">
          Back to sessions
        </a>
      </div>
      <p className="text-xs text-white/50">
        If you completed payment, your confirmation email will arrive shortly.
      </p>
    </div>
  );
}
