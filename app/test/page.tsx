export default function TestPage() {
  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-forest mb-4">
          ✅ SafariWrap is Working!
        </h1>
        <p className="text-xl text-stone mb-8">
          The app is running successfully.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-stone">
            <strong>Next.js:</strong> 16.2.3
          </p>
          <p className="text-sm text-stone">
            <strong>React:</strong> 19.2.4
          </p>
          <p className="text-sm text-stone">
            <strong>Status:</strong> Ready
          </p>
        </div>
        <div className="mt-8">
          <a href="/" className="text-forest underline">
            Go to Home Page
          </a>
        </div>
      </div>
    </div>
  );
}
