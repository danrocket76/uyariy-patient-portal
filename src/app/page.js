import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar Simple */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold text-blue-600 tracking-tight">UYARIY</div>
        <div className="space-x-4">
          <Link href="/login" className="text-gray-600 font-medium hover:text-blue-600">Login</Link>
          <Link href="/register" className="px-5 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            Advanced Hearing Health <br/>
            <span className="text-blue-600">Made Personal.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Access your audiograms, schedule appointments, and connect with your audiologist seamlessly through our secure patient portal.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/register" className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              Create Patient Account
            </Link>
            <Link href="/login" className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold text-lg hover:bg-gray-50 transition">
              Patient Login
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-gray-400 text-sm">
        <p>© 2026 Uyariy Health. All rights reserved.</p>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/admin`} target="_blank" rel="noopener noreferrer"
          className="text-xs text-gray-300 hover:text-blue-500 transition"
          >
          Staff / Doctor Portal Access
        </a>
      </footer>
    </div>
  );
}