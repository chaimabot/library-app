import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../api/client";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function inDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function AddBorrowing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedBookId = searchParams.get("book") || "";

  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [recent, setRecent] = useState([]);
  const [form, setForm] = useState({
    book_id: preselectedBookId,
    member_id: "",
    borrow_date: todayISO(),
    due_date: inDaysISO(14),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.books.list().then((data) => setBooks(data.filter((b) => b.status === "Available"))).catch(() => {});
    api.members.list().then(setMembers).catch(() => {});
    api.borrowings.list().then((data) => setRecent(data.slice(0, 5))).catch(() => {});
  }, []);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.book_id || !form.member_id || !form.borrow_date || !form.due_date) {
      setError("Tous les champs sont requis.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await api.borrowings.create({
        book_id: Number(form.book_id),
        member_id: Number(form.member_id),
        borrow_date: form.borrow_date,
        due_date: form.due_date,
      });
      navigate("/borrowings");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout active="borrowings">
<header className="fixed top-0 right-0 left-[280px] h-16 bg-surface-container-lowest dark:bg-surface-container-low border-b border-surface-variant dark:border-outline-variant flex justify-between items-center px-lg z-40">
<div className="flex items-center gap-md">
<span className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary">New Borrowing Entry</span>
</div>
</header>

<main className="ml-[280px] pt-24 pb-xl px-xl min-h-screen max-w-[1440px] mx-auto">
<div className="grid grid-cols-12 gap-gutter">

<div className="col-span-12 lg:col-span-8 space-y-lg">
<div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-xl shadow-sm">
<form className="space-y-xl" onSubmit={handleSubmit}>
{error && <p className="text-error font-body-sm bg-error-container/30 px-md py-sm rounded-lg">{error}</p>}

<div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
<div className="space-y-sm">
<label className="font-label-md text-label-md text-on-surface">Book Selection</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">menu_book</span>
<select
  className="w-full pl-10 pr-4 py-3 bg-surface border border-surface-variant rounded-lg text-body-md appearance-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
  value={form.book_id}
  onChange={(e) => update("book_id", e.target.value)}
>
<option value="">Search by title or ISBN...</option>
{books.map((b) => (
  <option key={b.id} value={b.id}>{b.title}{b.isbn ? ` (ISBN: ${b.isbn})` : ""}</option>
))}
</select>
</div>
{books.length === 0 && <p className="font-body-sm text-on-surface-variant">Aucun livre disponible pour l'emprunt.</p>}
</div>
<div className="space-y-sm">
<label className="font-label-md text-label-md text-on-surface">Member Selection</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">person_search</span>
<select
  className="w-full pl-10 pr-4 py-3 bg-surface border border-surface-variant rounded-lg text-body-md appearance-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
  value={form.member_id}
  onChange={(e) => update("member_id", e.target.value)}
>
<option value="">Search by name or email...</option>
{members.map((m) => (
  <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
))}
</select>
</div>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
<div className="space-y-sm">
<label className="font-label-md text-label-md text-on-surface" htmlFor="borrowDate">Borrow Date</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">calendar_today</span>
<input className="w-full pl-10 pr-4 py-3 bg-surface border border-surface-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" id="borrowDate" type="date" value={form.borrow_date} onChange={(e) => update("borrow_date", e.target.value)}/>
</div>
</div>
<div className="space-y-sm">
<label className="font-label-md text-label-md text-on-surface" htmlFor="dueDate">Due Date</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">event_upcoming</span>
<input className="w-full pl-10 pr-4 py-3 bg-surface border border-surface-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" id="dueDate" type="date" value={form.due_date} onChange={(e) => update("due_date", e.target.value)}/>
</div>
</div>
</div>

<div className="pt-xl flex justify-end gap-md">
<button className="px-xl py-2.5 bg-secondary-fixed text-on-secondary-fixed-variant hover:bg-secondary-fixed-dim rounded-lg font-label-md transition-all active:scale-95" type="button" onClick={() => navigate("/borrowings")}>Cancel</button>
<button className="px-xl py-2.5 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-label-md shadow-md transition-all active:scale-95 disabled:opacity-60" type="submit" disabled={saving}>
{saving ? "Saving..." : "Create Borrowing"}
</button>
</div>
</form>
</div>

<div className="bg-surface-container-high/50 border border-surface-variant rounded-xl p-lg">
<h3 className="font-label-md text-label-md text-on-surface-variant mb-md flex items-center">
<span className="material-symbols-outlined text-sm mr-sm">history</span>
                        Recent Borrowing Activity
                    </h3>
{recent.length === 0 ? (
  <p className="font-body-sm text-body-sm text-on-surface-variant">Aucun emprunt récent.</p>
) : (
<div className="space-y-md">
{recent.map((r) => (
<div key={r.id} className="flex items-center justify-between py-sm border-b border-surface-variant/50 last:border-b-0">
<div className="flex items-center gap-md">
<div className="w-8 h-10 bg-surface-container border border-surface-variant rounded flex items-center justify-center">
<span className="material-symbols-outlined text-xs text-on-surface-variant">book</span>
</div>
<div>
<p className="text-body-sm font-medium">{r.book_title}</p>
<p className="text-xs text-on-surface-variant">Borrowed by {r.member_name}</p>
</div>
</div>
<span className={
  "px-sm py-1 text-[10px] rounded-full font-bold uppercase tracking-wider " +
  (r.status === "Active" ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-high text-on-surface-variant")
}>{r.status}</span>
</div>
))}
</div>
)}
</div>
</div>

<div className="col-span-12 lg:col-span-4 space-y-lg">

<div className="bg-primary text-on-primary rounded-xl p-lg shadow-lg relative overflow-hidden group">
<div className="relative z-10">
<h3 className="font-headline-md text-headline-md mb-md">System Check</h3>
<div className="space-y-md">
<div className="flex justify-between items-center bg-white/10 p-md rounded-lg backdrop-blur-sm">
<div>
<p className="text-xs opacity-80 uppercase font-bold tracking-tighter">Total Stock</p>
<p className="text-headline-md font-bold">{books.length + members.length ? books.length : 0}</p>
</div>
<span className="material-symbols-outlined text-3xl">library_books</span>
</div>
<div className="flex justify-between items-center bg-white/10 p-md rounded-lg backdrop-blur-sm">
<div>
<p className="text-xs opacity-80 uppercase font-bold tracking-tighter">Available Now</p>
<p className="text-headline-md font-bold">{books.length}</p>
</div>
<span className="material-symbols-outlined text-3xl">check_circle</span>
</div>
</div>
<div className="mt-lg pt-lg border-t border-white/20">
<p className="text-body-sm italic opacity-90">"The library is the only place where you can find out about things that are none of your business."</p>
</div>
</div>
<div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
</div>

<div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
<h3 className="font-label-md text-label-md text-primary mb-lg flex items-center">
<span className="material-symbols-outlined mr-sm">info</span>
                        Borrowing Policies
                    </h3>
<ul className="space-y-lg">
<li className="flex gap-md">
<span className="material-symbols-outlined text-primary text-sm mt-1">verified_user</span>
<div>
<p className="text-label-md font-bold text-on-surface">Standard Period</p>
<p className="text-body-sm text-on-surface-variant">Loans are valid for 14 calendar days from the date of issue.</p>
</div>
</li>
<li className="flex gap-md">
<span className="material-symbols-outlined text-primary text-sm mt-1">warning</span>
<div>
<p className="text-label-md font-bold text-on-surface">Overdue Loans</p>
<p className="text-body-sm text-on-surface-variant">Loans past their due date are automatically flagged as overdue.</p>
</div>
</li>
<li className="flex gap-md">
<span className="material-symbols-outlined text-primary text-sm mt-1">sync</span>
<div>
<p className="text-label-md font-bold text-on-surface">Availability</p>
<p className="text-body-sm text-on-surface-variant">A book can only be lent to one member at a time.</p>
</div>
</li>
</ul>
</div>
</div>
</div>
</main>
    </Layout>
  );
}
