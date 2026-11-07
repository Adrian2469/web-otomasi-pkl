"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [role, setRole] = useState("pembimbing");
  const [nipOrNim, setNipOrNim] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!role || !nipOrNim || !pass) {
      setError("Harap lengkapi semua data");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ role, nipOrNim, pass }),
      });

      if (!res.ok) {
        setError("ID atau password salah");
        return;
      }

      const data = await res.json();

      // Bersihkan session lama sebelum set session baru
      localStorage.clear();
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("role", role);

      // Routing sesuai role
      if (role === "pembimbing") {
        router.push("/pembimbing");
      } else {
        router.push("/peserta");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan, coba lagi");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-700 mb-6">Login</h1>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Role Selection */}
          <div className="form-control">
            <label htmlFor="role" className="text-lg font-medium text-gray-600 mb-2">
              Pilih Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="pembimbing">Pembimbing</option>
              <option value="peserta">Peserta</option>
            </select>
          </div>

          {/* Input Field */}
          <div className="form-control">
            <label htmlFor="nipOrusername" className="text-lg font-medium text-gray-600 mb-2">
              {role === "pembimbing" ? "NIP" : "Username"}
            </label>
            <input
              type="text"
              id="nipOrusername"
              placeholder={role === "pembimbing" ? "Masukkan NIP" : "Masukkan Username"}
              value={nipOrNim}
              onChange={(e) => setNipOrNim(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-control">
            <label htmlFor="pass" className="text-lg font-medium text-gray-600 mb-2">Password</label>
            <input
              type="password"
              id="pass"
              placeholder="Masukkan Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-full mt-4 py-3 text-xl font-semibold"
          >
            Login
          </button>

          {/* Error Message */}
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}
