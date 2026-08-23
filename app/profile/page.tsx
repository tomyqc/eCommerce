"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", image: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((user) => user && setForm({ name: user.name || "", email: user.email || "", password: "", image: user.image || "" }));
  }, []);

  const updateImage = (file?: File) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024 || !file.type.startsWith("image/")) { toast.error("Use an image smaller than 4 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true);
    const response = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json(); setSaving(false);
    if (!response.ok) { toast.error(result.error || "Profile could not be updated"); return; }
    await update({ name: result.name, email: result.email, image: result.image });
    setForm((current) => ({ ...current, password: "" })); toast.success("Profile updated");
  };

  if (!session) return <main className="mx-auto max-w-xl p-8">Please sign in to view your profile.</main>;
  return <main className="mx-auto flex max-w-xl flex-col gap-6 p-6 sm:p-10">
    <div><h1 className="text-3xl font-semibold">My profile</h1><p className="mt-2 text-gray-600">Manage your account information and profile photo.</p></div>
    <form onSubmit={save} className="flex flex-col gap-4">
      <div className="flex items-center gap-4"><img src={form.image || "/randomuser.jpg"} alt="Profile" className="h-24 w-24 rounded-full object-cover" /><label className="btn btn-outline">Change photo<input type="file" accept="image/*" className="hidden" onChange={(event) => updateImage(event.target.files?.[0])} /></label></div>
      <label className="form-control"><span className="label-text">Name</span><input className="input input-bordered" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
      <label className="form-control"><span className="label-text">Email</span><input type="email" required className="input input-bordered" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
      <label className="form-control"><span className="label-text">New password</span><input type="password" minLength={8} className="input input-bordered" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Leave blank to keep current password" /></label>
      <div className="flex flex-wrap gap-3"><button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button><button type="button" className="btn btn-error" onClick={() => signOut({ callbackUrl: "/" })}>Log out</button><button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button></div>
    </form>
  </main>;
}
