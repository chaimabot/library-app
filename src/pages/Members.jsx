import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../api/client";

export default function Members() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [members, setMembers] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadMembers(query = "") {
    try {
      setLoading(true);
      const data = await api.members.list(query ? { q: query } : {});
      setMembers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
    api.borrowings.list().then(setBorrowings).catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadMembers(search);
      setSearchParams(search ? { q: search } : {}, { replace: true });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleDelete(id, name) {
    if (!window.confirm(`Supprimer "${name}" de la liste des membres ?`)) return;
    try {
      await api.members.remove(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  function borrowingCount(memberId) {
    return borrowings.filter((b) => b.member_id === memberId).length;
  }

  const totalActive = members.filter((m) => m.status === "Active").length;
  const avgBorrowings = members.length ? (borrowings.length / members.length).toFixed(1) : "0.0";
  const newRegistrations = members.filter((m) => {
    if (!m.created_at) return false;
    const created = new Date(m.created_at.replace(" ", "T") + "Z");
    return (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24) <= 30;
  }).length;

  return (
    <Layout active="members">
<header className="fixed top-0 right-0 left-[280px] h-16 bg-surface-container-lowest dark:bg-surface-container-low border-b border-surface-variant dark:border-outline-variant flex justify-between items-center px-lg w-auto gap-md z-40">
<div className="flex items-center gap-md shrink-0">
<h2 className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary">Members</h2>
</div>
<div className="flex items-center gap-lg min-w-0 justify-end">
<div className="relative flex-1 min-w-0 max-w-[220px] sm:max-w-xs hidden md:block">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
<input
  className="bg-surface-container-low border border-outline-variant rounded-full pl-10 pr-4 py-2 w-full text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
  placeholder="Search members..."
  type="text"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
</div>
</div>
</header>

<main className="ml-[280px] pt-16 min-h-screen">
<div className="max-w-container-max mx-auto p-lg">

<div className="flex flex-col md:flex-row md:items-center justify-between gap-lg mb-2xl">
<div>
<h3 className="font-headline-lg text-headline-lg text-on-surface">Member Directory</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage active library memberships and borrowing permissions.</p>
</div>
<Link to="/members/new" className="flex items-center justify-center gap-sm bg-primary text-on-primary px-lg py-md rounded-xl font-label-md hover:shadow-lg transition-shadow active:scale-95 duration-150">
<span className="material-symbols-outlined">person_add</span>
<span>Add Member</span>
</Link>
</div>

<div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden">
<div className="overflow-x-auto">

{error && <p className="px-lg py-md text-error font-body-sm">{error}</p>}
{loading ? (
  <p className="px-lg py-xl text-on-surface-variant font-body-sm">Chargement...</p>
) : members.length === 0 ? (
  <p className="px-lg py-xl text-on-surface-variant font-body-sm">Aucun membre trouvé.</p>
) : (
<table className="w-full border-collapse">
<thead>
<tr className="border-b border-surface-variant bg-surface-container-low">
<th className="text-left px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Name</th>
<th className="text-left px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Email</th>
<th className="text-left px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Phone</th>
<th className="text-center px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Borrowings</th>
<th className="text-right px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-variant">
{members.map((member) => (
<tr key={member.id} className="hover:bg-surface-container transition-colors">
<td className="px-lg py-md">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-full overflow-hidden bg-secondary-fixed flex-shrink-0 flex items-center justify-center">
{member.avatar_url ? (
  <img className="w-full h-full object-cover" src={member.avatar_url} alt={member.name} />
) : (
  <span className="material-symbols-outlined text-on-secondary-fixed-variant text-[20px]">person</span>
)}
</div>
<div>
<div className="font-label-md text-on-surface">{member.name}</div>
<div className="font-body-sm text-on-surface-variant">{member.status === "Active" ? "Active Member" : "Inactive"}</div>
</div>
</div>
</td>
<td className="px-lg py-md font-body-sm text-on-surface-variant">{member.email}</td>
<td className="px-lg py-md font-body-sm text-on-surface-variant">{member.phone || "—"}</td>
<td className="px-lg py-md text-center">
<span className="inline-flex items-center justify-center bg-primary-fixed/30 text-primary-fixed-dim px-3 py-1 rounded-full font-label-sm">{borrowingCount(member.id)}</span>
</td>
<td className="px-lg py-md text-right">
<div className="flex items-center justify-end gap-sm">
<Link to={`/borrowings?member=${member.id}`} className="inline-flex items-center gap-xs font-label-md text-primary hover:underline group">
                                        History
                                        <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">chevron_right</span>
</Link>
<button onClick={() => handleDelete(member.id, member.name)} className="text-on-surface-variant hover:text-error transition-colors">
<span className="material-symbols-outlined text-[20px]">delete</span>
</button>
</div>
</td>
</tr>
))}
</tbody>
</table>
)}
</div>

<div className="px-lg py-md border-t border-surface-variant flex items-center justify-between bg-surface-container-low">
<span className="font-body-sm text-on-surface-variant">Showing <span className="font-bold text-on-surface">{members.length}</span> member{members.length !== 1 ? "s" : ""}</span>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-lg mt-2xl">
<div className="bg-primary-container p-lg rounded-xl flex flex-col gap-sm">
<div className="flex items-center justify-between">
<span className="font-label-md text-on-primary-container">Total Active Members</span>
<span className="material-symbols-outlined text-on-primary-container">group</span>
</div>
<span className="font-display-lg text-[32px] text-on-primary-container leading-none">{totalActive}</span>
<span className="font-body-sm text-on-primary-container/80">out of {members.length} total</span>
</div>
<div className="bg-surface-container-high p-lg rounded-xl flex flex-col gap-sm">
<div className="flex items-center justify-between">
<span className="font-label-md text-on-surface">Average Borrowings</span>
<span className="material-symbols-outlined text-on-surface">auto_stories</span>
</div>
<span className="font-display-lg text-[32px] text-on-surface leading-none">{avgBorrowings}</span>
<span className="font-body-sm text-on-surface-variant">Books per member</span>
</div>
<div className="bg-surface-container-high p-lg rounded-xl flex flex-col gap-sm">
<div className="flex items-center justify-between">
<span className="font-label-md text-on-surface">New Registrations</span>
<span className="material-symbols-outlined text-on-surface">person_add</span>
</div>
<span className="font-display-lg text-[32px] text-on-surface leading-none">{newRegistrations}</span>
<span className="font-body-sm text-on-surface-variant">In the last 30 days</span>
</div>
</div>
</div>
</main>
    </Layout>
  );
}
