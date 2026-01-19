"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button
      onClick={logout}
      className="w-full rounded-lg bg-black px-3 py-2 text-white"
    >
      Dil
    </button>
  );
}
