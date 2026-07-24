import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../api/client";

export default function BooksList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({ totalVolumes: 0, activeLoans: 0, topGenre: "—", members: 0 });
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadBooks(query = "") {
    try {
      setLoading(true);
      const data = await api.books.list(query ? { q: query } : {});
      setBooks(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
    api.books.stats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadBooks(search);
      setSearchParams(search ? { q: search } : {}, { replace: true });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleDelete(id, title) {
    if (!window.confirm(`Supprimer "${title}" de la bibliothèque ?`)) return;
    try {
      await api.books.remove(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
      api.books.stats().then(setStats).catch(() => {});
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <Layout active="books">
<header className="fixed top-0 right-0 left-[280px] h-16 bg-surface-container-lowest border-b border-surface-variant flex justify-between items-center px-lg w-auto gap-md z-40">
<div className="flex items-center gap-md shrink-0">
<span className="font-headline-md text-headline-md font-bold text-primary">Books Inventory</span>
</div>
<div className="flex items-center gap-lg min-w-0 justify-end">
<div className="relative flex-1 min-w-0 max-w-[240px] sm:max-w-sm hidden md:block">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
<input
  className="bg-surface-container border-none rounded-full pl-10 pr-4 py-2 text-body-sm w-full focus:ring-2 focus:ring-primary focus:outline-none"
  placeholder="Search volumes, authors, ISBN..."
  type="text"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
</div>
</div>
</header>

<main className="ml-[280px] pt-16 min-h-screen">
<div className="max-w-container-max mx-auto p-lg space-y-xl">

<section className="flex flex-col md:flex-row md:items-center justify-between gap-md">
<div className="space-y-base">
<h2 className="font-headline-lg text-headline-lg text-on-surface">Curated Collection</h2>
<p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Manage your organizational library, track lending status, and discover new literature insights.</p>
</div>
<Link to="/books/new" className="inline-flex items-center justify-center gap-sm bg-primary text-on-primary px-lg py-md rounded-xl font-label-md text-label-md hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all duration-150">
<span className="material-symbols-outlined">add</span>
Add Book
</Link>
</section>

<section className="grid grid-cols-1 md:grid-cols-4 gap-lg">
<div className="bg-surface-container-lowest p-lg rounded-xl border border-surface-variant">
<div className="flex justify-between items-start mb-sm">
<span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">auto_stories</span>
</div>
<p className="text-label-md font-label-md text-on-surface-variant">Total Volumes</p>
<p className="text-headline-md font-headline-md font-bold">{stats.totalVolumes}</p>
</div>
<div className="bg-surface-container-lowest p-lg rounded-xl border border-surface-variant">
<div className="flex justify-between items-start mb-sm">
<span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">sync_alt</span>
</div>
<p className="text-label-md font-label-md text-on-surface-variant">Active Loans</p>
<p className="text-headline-md font-headline-md font-bold">{stats.activeLoans}</p>
</div>
<div className="bg-surface-container-lowest p-lg rounded-xl border border-surface-variant">
<div className="flex justify-between items-start mb-sm">
<span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">category</span>
</div>
<p className="text-label-md font-label-md text-on-surface-variant">Top Genre</p>
<p className="text-headline-md font-headline-md font-bold">{stats.topGenre}</p>
</div>
<div className="bg-surface-container-lowest p-lg rounded-xl border border-surface-variant">
<div className="flex justify-between items-start mb-sm">
<span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">group</span>
</div>
<p className="text-label-md font-label-md text-on-surface-variant">Members</p>
<p className="text-headline-md font-headline-md font-bold">{stats.members}</p>
</div>
</section>

<section className="bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden">
<div className="p-lg flex items-center justify-between border-b border-surface-variant">
<h3 className="font-headline-md text-headline-md">Inventory Explorer</h3>
</div>

{error && <p className="px-lg py-md text-error font-body-sm">{error}</p>}
{loading ? (
  <p className="px-lg py-xl text-on-surface-variant font-body-sm">Chargement...</p>
) : books.length === 0 ? (
  <p className="px-lg py-xl text-on-surface-variant font-body-sm">Aucun livre trouvé.</p>
) : (
<table className="w-full border-collapse">
<thead>
<tr className="bg-surface-container-low">
<th className="text-left px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Book Identity</th>
<th className="text-left px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Author</th>
<th className="text-left px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Category</th>
<th className="text-left px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
<th className="text-right px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-variant">
{books.map((book) => (
<tr key={book.id} className="hover:bg-surface-container/30 transition-colors">
<td className="px-lg py-md">
<div className="flex items-center gap-md">
<div className="w-10 h-14 bg-surface-variant rounded-sm flex-shrink-0 flex items-center justify-center overflow-hidden">
{book.cover_url ? (
  <img className="w-full h-full object-cover rounded-sm" src={book.cover_url} alt={book.title} />
) : (
  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">menu_book</span>
)}
</div>
<div>
<Link to={`/books/${book.id}`} className="font-body-md font-bold text-on-surface hover:text-primary transition-colors">{book.title}</Link>
<p className="font-body-sm text-on-surface-variant">ISBN: {book.isbn || "—"}</p>
</div>
</div>
</td>
<td className="px-lg py-md font-body-sm text-on-surface-variant">{book.author}</td>
<td className="px-lg py-md">
<span className="bg-primary/5 text-primary text-label-sm font-label-sm px-sm py-1 rounded-full">{book.category || "—"}</span>
</td>
<td className="px-lg py-md">
<div className={"flex items-center gap-xs " + (book.status === "Available" ? "text-secondary" : "text-error")}>
<span className={"w-2 h-2 rounded-full " + (book.status === "Available" ? "bg-secondary" : "bg-error")}></span>
<span className="font-label-sm text-label-sm">{book.status}</span>
</div>
</td>
<td className="px-lg py-md text-right">
<div className="flex items-center justify-end gap-sm">
<Link to={`/books/${book.id}`} className="text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined text-[20px]">visibility</span>
</Link>
<button onClick={() => handleDelete(book.id, book.title)} className="text-on-surface-variant hover:text-error transition-colors">
<span className="material-symbols-outlined text-[20px]">delete</span>
</button>
</div>
</td>
</tr>
))}
</tbody>
</table>
)}

<div className="p-lg border-t border-surface-variant flex items-center justify-between">
<p className="font-body-sm text-on-surface-variant">Showing <span className="font-bold text-on-surface">{books.length}</span> of {stats.totalVolumes} volumes</p>
</div>
</section>
</div>
</main>
    </Layout>
  );
}
