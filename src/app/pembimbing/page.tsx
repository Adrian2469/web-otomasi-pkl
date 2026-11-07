"use client";

import { useEffect, useState } from "react";

export default function PembimbingPage() {
  const [pembimbing, setPembimbing] = useState<any>(null);
  const [pesertaList, setPesertaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const stored = localStorage.getItem("user");
  const role = localStorage.getItem("role");
  if (!stored || role !== "pembimbing") {
    window.location.href = "/login";
  return;
}


  const pembimbingData = JSON.parse(stored);
  setPembimbing(pembimbingData);

  setLoading(true);
  fetch(`/api/pembimbing?pembimbingId=${pembimbingData.nip}`)
    .then((res) => res.json())
    .then((data) => setPesertaList(data))
    .finally(() => setLoading(false));
}, []);


  const handleDelete = async (pesertaId: number) => {
    if (!confirm("Yakin hapus peserta ini?")) return;

    await fetch("/api/pembimbing", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pesertaId }),
    });

    // Refresh list peserta
    fetch(`/api/pembimbing?pembimbingId=${pembimbing.nip}`)
      .then((res) => res.json())
      .then((data) => setPesertaList(data));
  };

  if (!pembimbing) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full bg-indigo-700 text-white px-6 py-4 shadow-lg flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img
            src="/avatar-default.png"
            alt="Foto Pembimbing"
            className="w-12 h-12 rounded-full border-2 border-white object-cover"
          />
          <h1 className="text-2xl font-bold">Dashboard Pembimbing PKL</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-lg font-semibold">{pembimbing.nama}</p>
            <p className="text-md text-gray-200">{pembimbing.lokasiPembimbing}</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("pembimbing");
              window.location.href = "/";
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-600 flex items-center justify-center p-8">
        <div className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-lg space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-700">📋 Informasi Pembimbing</h1>

          <div className="text-gray-700 text-center mb-6">
            <p className="text-2xl font-bold">{pembimbing.nama}</p>
            <p className="text-xl">{pembimbing.lokasiPembimbing}</p>
          </div>

          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Daftar Peserta Bimbingan</h2>

          {loading ? (
            <p className="text-center text-lg">Loading...</p>
          ) : pesertaList.length === 0 ? (
            <p className="text-center text-lg text-gray-600">Tidak ada peserta</p>
          ) : (
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="border border-gray-300 px-4 py-2 text-center">Nama</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Judul Laporan</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">File</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pesertaList.map((peserta) => (
                  <tr key={peserta.id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2 text-black">{peserta.nama}</td>
                    <td className="border border-gray-300 px-4 py-2 text-black">{peserta.judul || "Belum ada"}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {peserta.proposal ? (
                        <a
                          href={`/api/laporan/${encodeURIComponent(peserta.proposal)}`}
                          className="text-green-600 hover:underline font-semibold"
                        >
                          ⬇️ Download PDF
                        </a>
                      ) : (
                        <span className="text-gray-500">Belum ada</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button
                        onClick={() => handleDelete(peserta.id)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        ❌ Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
