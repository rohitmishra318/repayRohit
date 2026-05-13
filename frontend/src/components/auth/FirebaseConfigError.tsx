export function FirebaseConfigError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md bg-white rounded-2xl shadow-xl border-2 border-red-200 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-red-900">Firebase Not Configured</h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-semibold text-red-900">Setup Required:</p>
          <ol className="text-xs text-red-800 space-y-2 list-decimal list-inside">
            <li>Create <code className="bg-red-100 px-2 py-1 rounded">frontend/.env.local</code></li>
            <li>Add Firebase credentials from <code className="bg-red-100 px-2 py-1 rounded">console.firebase.google.com</code></li>
            <li>See <code className="bg-red-100 px-2 py-1 rounded">FIREBASE_SETUP.md</code> for instructions</li>
            <li>Restart development server</li>
          </ol>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            <span className="font-semibold">Quick Start:</span> Copy this to <code className="bg-yellow-100 px-1">frontend/.env.local</code>:
          </p>
          <pre className="text-xs bg-yellow-100 p-2 rounded mt-2 overflow-auto text-yellow-900">
{`VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id`}
          </pre>
        </div>

        <div className="pt-4 border-t border-red-200">
          <p className="text-xs text-slate-600 text-center">
            Then refresh this page after setup
          </p>
        </div>
      </div>
    </div>
  );
}
