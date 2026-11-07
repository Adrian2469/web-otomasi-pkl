import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-base-200">
      {/* Hero Section */}
      <div className="hero min-h-[45vh] bg-gradient-to-r from-purple-500 to-blue-600">
        <div className="hero-content text-center text-white">
          <div className="max-w-lg">
            <h1 className="text-5xl font-extrabold mb-4">Selamat datang di Dashboard PKL</h1>
            <p className="text-lg mb-8">
              Kelola data peserta, pembimbing, dan pendaftaran dengan mudah.
            </p>
          </div>
        </div>
      </div>

      {/* Menu Cards Section */}
      <div
        id="menu"
        className="py-13 px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <div className="card bg-black shadow-xl hover:shadow-2xl transition">
          <div className="card-body text-center">
            <span className="text-6xl text-blue-500">📋</span>
            <h2 className="card-title text-2xl mt-4 justify-center">Data Peserta</h2>
            <p>Kelola semua data peserta PKL.</p>
            <div className="card-actions justify-center mt-4">
              <Link href="/login" className="btn btn-primary">Lihat Data</Link>
            </div>
          </div>
        </div>

        <div className="card bg-black shadow-xl hover:shadow-2xl transition">
          <div className="card-body text-center">
            <span className="text-6xl text-green-500">👨‍🏫</span>
            <h2 className="card-title text-2xl mt-4 justify-center">Data Pembimbing</h2>
            <p>Kelola semua data pembimbing PKL.</p>
            <div className="card-actions justify-center mt-4">
              <Link href="/login" className="btn btn-success">Lihat Data</Link>
            </div>
          </div>
        </div>

        <div className="card bg-black shadow-xl hover:shadow-2xl transition">
          <div className="card-body text-center">
            <span className="text-6xl text-purple-500">📝</span>
            <h2 className="card-title text-2xl mt-4 justify-center">Pendaftaran</h2>
            <p>Daftar peserta baru untuk PKL.</p>
            <div className="card-actions justify-center mt-4">
              <Link href="/pendaftaran" className="btn btn-warning">Daftar Sekarang</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="footer footer-center p-9 bg-primary text-white mt-8">
        <div>
          <p className="text-lg font-semibold">Dashboard PKL</p>
          <p>© 2025 Semua Hak Dilindungi</p>
        </div>
      </footer>
    </main>
  );
}
