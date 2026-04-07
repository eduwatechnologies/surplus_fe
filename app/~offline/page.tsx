export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-2xl font-semibold">You’re offline</h1>
        <p className="text-sm text-gray-600">
          Check your internet connection and try again.
        </p>
      </div>
    </main>
  );
}
