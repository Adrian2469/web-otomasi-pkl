'use client';

import { useEffect, useState } from "react";
import md5 from "crypto-js/md5";

interface LokasiKuota {
  lokasi: string;
  kuota: number;
  total: number;
  terpakai: number;
}

export default function FormPendaftaran({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState({
    nama: "",
    prodi: "",
    lokasiPkl: "",
    universitas: "",
    username: "",
    pass: "",
    proposal: null as File | null,
  });
  
  const [lokasiList, setLokasiList] = useState<LokasiKuota[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch kuota lokasi
  const fetchKuotaLokasi = async () => {
    try {
      const res = await fetch("/api/pembimbing?mode=kuota");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setLokasiList(data);
      } else {
        console.error("Data pembimbing bukan array:", data);
        setError("Gagal memuat data lokasi");
      }
    } catch (err) {
      console.error("Gagal mengambil data pembimbing:", err);
      setError("Gagal memuat data lokasi");
    }
  };

  useEffect(() => {
    fetchKuotaLokasi();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(""); // Clear error saat user input
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm(prev => ({ ...prev, proposal: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.proposal) {
      setError("Silakan upload proposal PDF");
      setLoading(false);
      return;
    }

    if (!form.nama || !form.prodi || !form.lokasiPkl || !form.universitas || !form.username || !form.pass) {
      setError("Semua field wajib diisi");
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append("nama", form.nama);
      fd.append("prodi", form.prodi);
      fd.append("lokasiPkl", form.lokasiPkl);
      fd.append("universitas", form.universitas);
      fd.append("proposal", form.proposal);
      fd.append("username", form.username);
      const hashedPass = md5(form.pass).toString();
      fd.append("pass", hashedPass);

      const res = await fetch("/api/pendaftaran", {
        method: "POST",
        body: fd,
      });

      const result = await res.json();

      if (res.ok) {
        alert(`Pendaftaran berhasil!\nPembimbing: ${result.pembimbing}\nJudul: ${result.judul}`);
        setForm({ nama: "", prodi: "", lokasiPkl: "", universitas: "", username: "",pass: "", proposal: null });
        
        // Refresh kuota setelah pendaftaran berhasil
        await fetchKuotaLokasi();
        
        onSuccess?.();
      } else {
        setError(result.error || "Terjadi kesalahan saat mendaftar");
      }
    } catch (err) {
      console.error("Error submit:", err);
      setError("Terjadi kesalahan saat mendaftar");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Tambahkan div untuk background gradasi
    <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-black min-h-screen flex justify-center items-center">
      <div className="max-w-4xl mx-auto p-10 bg-white rounded-lg shadow-lg mt-10">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">Pendaftaran PKL</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          {/* Kolom 1 */}
          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">Nama</label>
            <input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              className="border border-gray-400 placeholder-gray-400 text-gray-700 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">Program Studi</label>
            <input
              name="prodi"
              value={form.prodi}
              onChange={handleChange}
              placeholder="Masukkan program studi"
              className="border border-gray-400 placeholder-gray-400 text-gray-700 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">Lokasi PKL</label>
            <select
              name="lokasiPkl"
              value={form.lokasiPkl}
              onChange={handleChange}
              className="border border-gray-400 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              required
            >
              <option value="" disabled className="text-gray-500">
                Pilih Lokasi PKL
              </option>
              {lokasiList.map((item, i) => (
                <option key={i} value={item.lokasi} disabled={item.kuota <= 0}>
                  {item.lokasi} ({item.kuota} dari {item.total} kuota tersisa)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">Universitas</label>
            <input
              name="universitas"
              value={form.universitas}
              onChange={handleChange}
              placeholder="Masukkan nama universitas"
              className="border border-gray-400 placeholder-gray-400 text-gray-700 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Buat username"
              className="border border-gray-400 placeholder-gray-400 text-gray-700 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="pass"
              value={form.pass}
              onChange={handleChange}
              placeholder="Buat password"
              className="border border-gray-400 placeholder-gray-400 text-gray-700 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-md font-medium text-gray-700 mb-2">Proposal (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="border border-gray-400 text-gray-700 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {form.proposal && (
              <p className="text-sm text-gray-600 mt-2">File: {form.proposal.name}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-3 rounded font-medium transition-colors"
            >
              {loading ? "Mendaftar..." : "Daftar PKL"}
            </button>
          </div>
        </form>

        {/* Status Kuota */}
        {lokasiList.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg text-gray-700 mb-2">Status Kuota:</h3>
            {lokasiList.map((item, i) => (
              <div
                key={i}
                className={`text-sm mb-1 ${
                  item.kuota <= 0
                    ? "text-red-600"
                    : item.kuota <= 3
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                <span className="font-medium">{item.lokasi}:</span> {item.terpakai}/{item.total} terisi
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}