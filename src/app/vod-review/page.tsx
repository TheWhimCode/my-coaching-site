export default function VODReviewPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Feature Card */}
        <div className="bg-blue-800 rounded-2xl p-6">
          <h1 className="text-3xl font-bold mb-4">VOD Review</h1>
          <p className="text-sm mb-6 text-white/80">League of Legends gameplay analysis</p>
          <ul className="space-y-2">
            <li>✔ Deep analysis</li>
            <li>✔ Timestamped notes</li>
            <li>✔ Tailored advice</li>
            <li>✔ Tailored advice</li>
            <li>✔ Tailored advice</li>
            <li>✔ Tailored advice</li>
            <li>✔ Tailored advice</li>
          </ul>
        </div>

        {/* Center: Gameplay Image */}
        <div className="flex items-center justify-center">
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-800">
            {/* Replace with real image later */}
            <p className="text-center pt-24 text-white/30">[Gameplay Image Placeholder]</p>
          </div>
        </div>

        {/* Right: Info + CTA */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl p-4 text-sm text-white/80">
            <div>⏱ 60 mins</div>
            <div>💰 35€</div>
          </div>

          <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold w-full py-3 rounded-xl transition">
            Book Now
          </button>

          <div className="bg-gray-900/60 backdrop-blur rounded-xl p-4 text-white/80 text-sm">
            <p>"Biggest skill jump I've had in years!" – Former Student</p>
          </div>
        </div>
      </div>
    </main>
  );
}