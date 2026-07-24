import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../api/client";

const TABS = [
  { key: "all", label: "All Loans" },
  { key: "Active", label: "Active" },
  { key: "Overdue", label: "Overdue" },
  { key: "Returned", label: "Returned" },
];

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export default function Borrowings() {
  const [searchParams] = useSearchParams();
  const memberFilter = searchParams.get("member");

  const [borrowings, setBorrowings] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const data = await api.borrowings.list();
      setBorrowings(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function displayStatus(b) {
    if (b.status === "Active" && b.due_date && new Date(b.due_date) < new Date()) return "Overdue";
    return b.status;
  }

  const filtered = useMemo(() => {
    return borrowings
      .filter((b) => (memberFilter ? String(b.member_id) === memberFilter : true))
      .filter((b) => (tab === "all" ? true : displayStatus(b) === tab))
      .filter((b) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          b.book_title?.toLowerCase().includes(q) ||
          b.member_name?.toLowerCase().includes(q)
        );
      });
  }, [borrowings, tab, search, memberFilter]);

  const activeLoansCount = borrowings.filter((b) => b.status === "Active").length;

  async function handleReturn(id) {
    try {
      await api.borrowings.return(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Supprimer l'emprunt de "${title}" ?`)) return;
    try {
      await api.borrowings.remove(id);
      setBorrowings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <Layout active="borrowings">
<header className="fixed top-0 right-0 left-[280px] h-16 bg-surface-container-lowest dark:bg-surface-container-low border-b border-surface-variant dark:border-outline-variant flex justify-between items-center px-lg w-auto gap-md z-40">
<h2 className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary shrink-0">Borrowings</h2>
<div className="flex items-center gap-lg min-w-0 justify-end">
<div className="relative flex-1 min-w-0 max-w-[220px] sm:max-w-xs hidden md:block">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
<input
  className="bg-surface-container border border-outline-variant rounded-xl pl-10 pr-4 py-2 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary w-full transition-all"
  placeholder="Search loans or members..."
  type="text"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
</div>
</div>
</header>

<main className="pl-[280px] pt-16 min-h-screen">
<div className="p-lg max-w-container-max mx-auto">

<div className="flex flex-wrap items-center justify-between gap-md mb-xl">
<div className="flex items-center gap-sm overflow-x-auto pb-2 md:pb-0">
{TABS.map((t) => (
<button
  key={t.key}
  onClick={() => setTab(t.key)}
  className={
    "px-md py-sm rounded-lg font-label-md text-label-md transition-colors " +
    (tab === t.key
      ? "bg-primary text-on-primary"
      : "bg-surface-container-high text-on-surface-variant hover:bg-secondary-container")
  }
>
  {t.label}
</button>
))}
</div>
<Link to="/borrowings/new" className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary hover:opacity-90 transition-all rounded-lg font-label-sm text-label-sm shadow-sm active:scale-95">
<span className="material-symbols-outlined text-[18px]">add</span>
                        New Borrowing
                    </Link>
</div>

<div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden">
{error && <p className="px-lg py-md text-error font-body-sm">{error}</p>}
{loading ? (
  <p className="px-lg py-xl text-on-surface-variant font-body-sm">Chargement...</p>
) : filtered.length === 0 ? (
  <p className="px-lg py-xl text-on-surface-variant font-body-sm">Aucun emprunt trouvé.</p>
) : (
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low border-b border-surface-variant">
<th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Borrowed Book</th>
<th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Member Name</th>
<th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Borrow Date</th>
<th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Due / Return Date</th>
<th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
<th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-variant">
{filtered.map((b) => {
  const status = displayStatus(b);
  const badgeClass =
    status === "Overdue"
      ? "bg-error-container text-on-error-container"
      : status === "Returned"
      ? "bg-surface-container-high text-on-surface-variant"
      : "bg-secondary-container text-on-secondary-container";
  const badgeIcon = status === "Overdue" ? "warning" : status === "Returned" ? "check_circle" : "schedule";
  return (
<tr key={b.id} className="hover:bg-surface-container transition-colors group">
<td className={"px-lg py-md " + (status === "Returned" ? "opacity-60" : "")}>
<div className="flex items-center gap-md">
<div className="w-12 h-16 flex-shrink-0 bg-surface-container rounded border border-outline-variant overflow-hidden flex items-center justify-center">
{b.book_cover_url ? (
  <img className="w-full h-full object-cover" src={b.book_cover_url} alt={b.book_title} />
) : (
  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">book</span>
)}
</div>
<div>
<div className="font-label-md text-label-md text-on-surface">{b.book_title}</div>
<div className="font-body-sm text-body-sm text-on-surface-variant opacity-70">{b.book_author}</div>
</div>
</div>
</td>
<td className="px-lg py-md font-body-sm text-body-sm text-on-surface">{b.member_name}</td>
<td className="px-lg py-md font-body-sm text-body-sm text-on-surface">{formatDate(b.borrow_date)}</td>
<td className={"px-lg py-md font-body-sm text-body-sm " + (status === "Overdue" ? "text-error font-medium" : "text-on-surface")}>
{b.return_date ? formatDate(b.return_date) : formatDate(b.due_date)}
</td>
<td className="px-lg py-md">
<span className={"inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm " + badgeClass}>
<span className="material-symbols-outlined text-[14px] mr-1">{badgeIcon}</span>
                                    {status}
                                </span>
</td>
<td className="px-lg py-md">
<div className="flex items-center gap-sm">
{b.status === "Active" && (
<button onClick={() => handleReturn(b.id)} className="font-label-sm text-label-sm text-primary hover:underline">
  Return
</button>
)}
<button onClick={() => handleDelete(b.id, b.book_title)} className="text-on-surface-variant hover:text-error transition-colors">
<span className="material-symbols-outlined text-[18px]">delete</span>
</button>
</div>
</td>
</tr>
  );
})}
</tbody>
</table>
)}
</div>

<div className="mt-lg flex items-center justify-between">
<p className="font-body-sm text-body-sm text-on-surface-variant">Showing {filtered.length} of {borrowings.length} results</p>
</div>

<div className="mt-3xl grid grid-cols-1 md:grid-cols-3 gap-lg">
<div className="col-span-1 md:col-span-2 bg-primary-fixed text-on-primary-fixed p-xl rounded-2xl relative overflow-hidden flex flex-col justify-between h-48 group">
<div className="absolute -right-8 -top-8 w-48 h-48 bg-on-primary-fixed/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
<div>
<h3 className="font-headline-md text-headline-md font-bold mb-xs">Library Analytics</h3>
<p className="font-body-sm text-body-sm opacity-80 max-w-sm">{activeLoansCount} loans are currently active across the collection.</p>
</div>
</div>
<div className="bg-surface-container-high p-xl rounded-2xl border border-surface-variant flex flex-col justify-center items-center text-center">
<span className="material-symbols-outlined text-primary text-[48px] mb-md">auto_stories</span>
<div className="font-headline-lg text-headline-lg font-bold text-on-surface">{activeLoansCount}</div>
<div className="font-label-md text-label-md text-on-surface-variant">Active Loans System-wide</div>
</div>
</div>
</div>
</main>
    </Layout>
  );
}
