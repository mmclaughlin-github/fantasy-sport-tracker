import { useNavigate } from 'react-router-dom';

export default function InstallInstructions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Install on Your Phone
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Add this app to your home screen for quick access
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="card mb-6 bg-blue-50 border-2 border-blue-200">
          <div className="flex gap-3">
            <div className="text-3xl">📱</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Why Install This App?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Access the app instantly from your home screen</li>
                <li>✓ Works offline after first load</li>
                <li>✓ Faster loading times</li>
                <li>✓ Full-screen experience without browser bars</li>
                <li>✓ Receive notifications (coming soon)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* iPhone/iOS Instructions */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl"></div>
            <div>
              <h2 className="text-xl font-bold">iPhone (iOS / Safari)</h2>
              <p className="text-sm text-gray-600">
                For iPhone and iPad users
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  Open this website in Safari
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Make sure you're using Safari browser (not Chrome or other browsers).
                  If you're in another browser, copy the URL and open it in Safari.
                </p>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                  https://your-app-url.onrender.com
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  Tap the Share button
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  At the bottom of the screen (iPhone) or top (iPad), tap the Share icon
                </p>
                <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  <span className="text-sm font-medium">Share button (square with arrow)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  Select "Add to Home Screen"
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Scroll down in the share menu and tap "Add to Home Screen"
                </p>
                <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                  </svg>
                  <span className="text-sm font-medium">Add to Home Screen</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  Confirm and Add
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  You can customize the name if you want, then tap "Add" in the top right corner.
                </p>
                <p className="text-sm text-green-600 font-medium">
                  ✓ Done! The app icon will appear on your home screen.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Android Instructions */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🤖</div>
            <div>
              <h2 className="text-xl font-bold">Android (Chrome)</h2>
              <p className="text-sm text-gray-600">
                For Android phone and tablet users
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  Open this website in Chrome
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Make sure you're using Chrome browser for the best experience.
                </p>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                  https://your-app-url.onrender.com
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  Tap the Menu button
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Tap the three dots (⋮) in the top-right corner of Chrome
                </p>
                <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                  <span className="text-sm font-medium">Three dots menu</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  Select "Add to Home screen" or "Install app"
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  You may see either option depending on your Android version:
                </p>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                    </svg>
                    <span className="text-sm font-medium">Add to Home screen</span>
                  </div>
                  <div className="text-sm text-gray-600">or</div>
                  <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Install app</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  Tap "Add" or "Install"
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Confirm the installation when prompted. You can customize the name if you wish.
                </p>
                <p className="text-sm text-green-600 font-medium">
                  ✓ Done! The app icon will appear on your home screen.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              Alternative Method: Install Banner
            </h4>
            <p className="text-sm text-blue-800">
              Chrome may show a banner at the bottom of the screen saying "Add Youth Fantasy Sports to Home screen."
              You can tap "Add" directly from this banner for a quicker installation.
            </p>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="card bg-gray-50">
          <h2 className="text-lg font-bold mb-4">Troubleshooting</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-1">
                Don't see "Add to Home Screen" option?
              </h3>
              <p className="text-sm text-gray-600">
                • Make sure you're using the correct browser (Safari for iOS, Chrome for Android)
                <br />
                • Try closing and reopening the browser
                <br />
                • Check if you have enough storage space on your device
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-1">
                App icon doesn't appear after adding?
              </h3>
              <p className="text-sm text-gray-600">
                • Check the last page of your home screen
                <br />
                • On iPhone, swipe right to the App Library and search
                <br />
                • Try installing again
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-1">
                Want to remove the app?
              </h3>
              <p className="text-sm text-gray-600">
                <strong>iPhone:</strong> Long-press the app icon → Remove App → Delete
                <br />
                <strong>Android:</strong> Long-press the app icon → Uninstall or Remove
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
