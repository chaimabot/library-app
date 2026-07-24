import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../api/client";

export default function AddMember() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleHeaderSearch(e) {
    if (e.key !== "Enter") return;
    const q = e.target.value.trim();
    navigate(q ? `/members?q=${encodeURIComponent(q)}` : "/members");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError("Le nom et l'email sont requis.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await api.members.create(form);
      navigate("/members");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout active="members">
<header className="fixed top-0 right-0 left-[280px] h-16 bg-surface-container-lowest border-b border-surface-variant flex justify-between items-center px-lg z-40">
<div className="flex items-center gap-md min-w-0 max-w-xs">
<span className="material-symbols-outlined text-on-surface-variant shrink-0">search</span>
<input className="bg-transparent border-none focus:ring-0 font-body-sm text-body-sm w-full min-w-0 text-on-surface" placeholder="Search members..." type="text" onKeyDown={handleHeaderSearch}/>
</div>
</header>

<main className="ml-[280px] pt-16 min-h-screen">
<div className="max-w-[1280px] mx-auto p-2xl">

<div className="mb-2xl flex flex-col md:flex-row md:items-end justify-between gap-md">
<div>
<nav className="flex items-center gap-xs text-on-surface-variant mb-sm">
<span className="font-label-sm text-label-sm">Members</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
<span className="font-label-sm text-label-sm text-primary">Add New Member</span>
</nav>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Add Library Member</h2>
<p className="font-body-md text-body-md text-on-surface-variant">Register a new reader into the knowledge ecosystem.</p>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">

<div className="lg:col-span-4 space-y-lg">
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col items-center text-center">
<div className="w-40 h-40 rounded-full border-4 border-surface-container-low overflow-hidden bg-surface-container shadow-sm flex items-center justify-center mb-md">
<span className="material-symbols-outlined text-[64px] text-on-surface-variant">person</span>
</div>
<h3 className="font-headline-md text-headline-md mb-xs">Profile Picture</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">Photo upload isn't available yet — a default avatar will be used.</p>
</div>

<div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
<h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-md">Membership Status</h3>
<div className="space-y-sm">
<label className="flex items-center gap-md p-md bg-surface-container-low rounded-lg cursor-pointer">
<input type="radio" name="status" checked={form.status === "Active"} onChange={() => update("status", "Active")} />
<span className="font-label-md text-label-md text-on-surface">Active</span>
</label>
<label className="flex items-center gap-md p-md bg-surface-container-low rounded-lg cursor-pointer">
<input type="radio" name="status" checked={form.status === "Inactive"} onChange={() => update("status", "Inactive")} />
<span className="font-label-md text-label-md text-on-surface">Inactive</span>
</label>
</div>
</div>
</div>

<div className="lg:col-span-8 space-y-lg">
<form className="space-y-lg" onSubmit={handleSubmit}>
{error && <p className="text-error font-body-sm bg-error-container/30 px-md py-sm rounded-lg">{error}</p>}

<div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
<h3 className="font-headline-md text-headline-md mb-lg border-b border-surface-variant pb-md">Essential Information</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-lg">

<div className="space-y-sm">
<label className="font-label-md text-label-md text-on-surface flex items-center gap-xs" htmlFor="name">
                                        Full Name
                                        <span className="text-error">*</span>
</label>
<input className="w-full border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-sm text-body-sm bg-surface-bright" id="name" placeholder="e.g. Julian Thorne" type="text" value={form.name} onChange={(e) => update("name", e.target.value)}/>
</div>

<div className="space-y-sm">
<label className="font-label-md text-label-md text-on-surface flex items-center gap-xs" htmlFor="email">
                                        Email Address
                                        <span className="text-error">*</span>
</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
<input className="w-full border border-outline-variant rounded-lg pl-xl pr-md py-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-sm text-body-sm bg-surface-bright" id="email" placeholder="julian.t@libris.com" type="email" value={form.email} onChange={(e) => update("email", e.target.value)}/>
</div>
</div>

<div className="space-y-sm md:col-span-2">
<label className="font-label-md text-label-md text-on-surface" htmlFor="phone">Phone Number</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">phone</span>
<input className="w-full border border-outline-variant rounded-lg pl-xl pr-md py-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-sm text-body-sm bg-surface-bright" id="phone" placeholder="+1 (555) 000-0000" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}/>
</div>
</div>
</div>
</div>

<div className="flex items-center justify-end gap-md pt-lg">
<button className="px-xl py-md rounded-lg font-label-md text-label-md text-on-secondary-fixed-variant bg-surface-container hover:bg-surface-container-high transition-all active:scale-95" type="button" onClick={() => navigate("/members")}>
                                Cancel
                            </button>
<button className="px-xl py-md rounded-lg font-label-md text-label-md bg-primary text-on-primary hover:bg-primary-container shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-md disabled:opacity-60" type="submit" disabled={saving}>
<span className="material-symbols-outlined text-[20px]">person_add</span>
                                {saving ? "Saving..." : "Save Member"}
                            </button>
</div>
</form>
</div>
</div>
</div>
</main>
    </Layout>
  );
}
