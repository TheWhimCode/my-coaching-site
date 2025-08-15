export default function SuccessPage() {
  return (
    <main className="grid min-h-[60vh] place-items-center text-white">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold">Payment received ✅</h1>
        <p className="text-white/70">We’re confirming your booking. Check your email shortly.</p>
        <a href="/" className="inline-block rounded-lg bg-emerald-600 px-4 py-2">Back to home</a>
      </div>
    </main>
  );
}
