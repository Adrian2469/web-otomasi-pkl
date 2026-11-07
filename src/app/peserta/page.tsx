"use client";
import { useEffect, useState } from "react";

export default function PesertaPage() {
  const [peserta, setPeserta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<File | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    if (!stored || role !== "peserta") {
      window.location.href = "/login";
      return;
    }


    const data = JSON.parse(stored);
    fetch(`/api/peserta?username=${data.username}`)
      .then((res) => res.json())
      .then(setPeserta)
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal || !peserta?.username) return;

    const formData = new FormData();
    formData.append("proposal", proposal);
    formData.append("username", peserta.username);

    const res = await fetch("/api/peserta", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    alert(`Judul terdeteksi: ${result.judul}`);

    // Refresh data
    fetch(`/api/peserta?username=${peserta.username}`)
      .then((res) => res.json())
      .then(setPeserta);
  };

  if (loading) return <p>Loading...</p>;
  if (!peserta) return <p>Peserta tidak ditemukan</p>;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dashboard Header */}
     <header className="w-full bg-indigo-700 text-white px-6 py-4 shadow-lg flex justify-between items-center">
  {/* Kiri: Judul */}
  
 <div className="flex items-center space-x-4">
    {/* Avatar Bundar */}
    <img
      src="/avatar-default.png" // Ganti dengan path gambar kamu
      alt="Foto Peserta"
      className="w-12 h-12 rounded-full border-2 border-white object-cover"
    />
    <h1 className="text-2xl font-bold">Dashboard Peserta PKL</h1>
  </div>

  {/* Kanan: Info Peserta & Logout */}
  <div className="flex items-center space-x-4">
    <div className="text-right">
      <p className="text-lg font-semibold">{peserta.nama}</p>
      <p className="text-md text-gray-200">{peserta.prodi}</p>
    </div>
    <button
      onClick={() => {
        localStorage.removeItem("peserta");
        window.location.href = "/";
      }}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold"
    >
      Logout
    </button>
  </div>
</header>

      {/* Main Content Area with Gradient Background */}
      <div className="flex-grow bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-600 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-700">
            📋 Informasi Peserta PKL
          </h1>

          {/* Peserta Information */}
          <div className="space-y-3 text-gray-700">
            <div className="grid items-start gap-x-4" style={{ gridTemplateColumns: "150px 10px 1fr" }}>
              <span className="font-semibold">Nama Peserta</span>
              <span className="text-left">:</span>
              <span className="break-words text-left">{peserta.nama}</span>
            </div>

            <div className="grid items-start gap-x-4" style={{ gridTemplateColumns: "150px 10px 1fr" }}>
              <span className="font-semibold">Prodi</span>
              <span className="text-left">:</span>
              <span className="break-words text-left">{peserta.prodi}</span>
            </div>

            <div className="grid items-start gap-x-4" style={{ gridTemplateColumns: "150px 10px 1fr" }}>
              <span className="font-semibold">Universitas</span>
              <span className="text-left">:</span>
              <span className="break-words text-left">{peserta.universitas}</span>
            </div>

            <div className="grid items-start gap-x-4" style={{ gridTemplateColumns: "150px 10px 1fr" }}>
              <span className="font-semibold">Nama Pembimbing</span>
              <span className="text-left">:</span>
              <span className="break-words text-left">
                {peserta.pembimbing?.nama || "Belum ditentukan"}
              </span>
            </div>

            <div className="grid items-start gap-x-4" style={{ gridTemplateColumns: "150px 10px 1fr" }}>
              <span className="font-semibold">Judul Proposal</span>
              <span className="text-left">:</span>
              <span className="break-words text-left">{peserta.judul || "Belum ada"}</span>
            </div>
          </div>

          {/* Upload Proposal Form */}
          <div className="w-full bg-white shadow-inner p-6">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                📤 Upload Proposal
              </h3>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="form-control">
                  <label className="text-lg font-medium text-gray-600">
                    Pilih Proposal File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setProposal(e.target.files?.[0] || null)}
                    className="file-input file-input-bordered w-full"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-full py-3 text-xl"
                >
                  Upload Proposal
                </button>
              </form>
            </div>
          </div>
        </div>
        </div>
      </div>
  );
}
