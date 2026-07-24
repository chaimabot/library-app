import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../api/client";

function timeAgo(value) {
  if (!value) return "—";
  const date = new Date(value.replace(" ", "T") + "Z");
  const diffMs = Date.now() - date.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${Math.floor(diffH)}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return `${diffD}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

export default function HomeDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalVolumes: 0, activeLoans: 0, topGenre: "—", members: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadDashboard() {
    try {
      setLoading(true);
      const [statsData, books, borrowings] = await Promise.all([
        api.books.stats(),
        api.books.list(),
        api.borrowings.list(),
      ]);
      setStats(statsData);
      setNewArrivals(books.slice(0, 4));

      const activity = borrowings.slice(0, 5).map((b) => ({
        id: b.id,
        title: b.book_title,
        cover_url: b.book_cover_url,
        when: b.status === "Returned" ? b.return_date : b.created_at,
        label:
          b.status === "Returned" ? (
            <>Returned by <span className="font-medium text-on-surface">{b.member_name}</span></>
          ) : (
            <>Borrowed by <span className="font-medium text-on-surface">{b.member_name}</span></>
          ),
      }));
      setRecentActivity(activity);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function handleHeaderSearch(e) {
    if (e.key !== "Enter") return;
    const q = e.target.value.trim();
    navigate(q ? `/books?q=${encodeURIComponent(q)}` : "/books");
  }

  const availableBooks = Math.max(stats.totalVolumes - stats.activeLoans, 0);
  const occupancyPct = stats.totalVolumes ? Math.round((stats.activeLoans / stats.totalVolumes) * 100) : 0;
  const goalTarget = 200;
  const goalPct = Math.min(100, Math.round((stats.totalVolumes / goalTarget) * 100));

  return (
    <Layout active="home">
<header className="fixed top-0 right-0 left-[280px] h-16 bg-surface-container-lowest dark:bg-surface-container-low border-b border-surface-variant dark:border-outline-variant flex justify-between items-center px-lg w-auto gap-md z-10">
<div className="flex items-center gap-md shrink-0">
<h2 className="font-headline-md text-headline-md font-bold text-primary">Overview</h2>
</div>
<div className="flex items-center gap-lg min-w-0 justify-end">

<div className="relative flex-1 min-w-0 max-w-[220px] sm:max-w-xs hidden md:block">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" data-icon="search">search</span>
<input className="bg-surface-container border-none rounded-full pl-10 pr-4 py-2 w-full text-body-sm focus:ring-2 focus:ring-primary transition-all" placeholder="Search library..." type="text" onKeyDown={handleHeaderSearch}/>
</div>

<div className="flex items-center gap-sm shrink-0">
<button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-highest rounded-full p-2 transition-colors focus:outline-none" data-icon="notifications">notifications</button>
<button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-highest rounded-full p-2 transition-colors focus:outline-none" data-icon="settings">settings</button>
</div>

<div className="flex items-center gap-sm border-l border-surface-variant pl-lg shrink-0">
<Link to="/profile" className="w-8 h-8 rounded-full bg-primary-container overflow-hidden ring-2 ring-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-[20px]">person</span>
</Link>
</div>
</div>
</header>

<main className="ml-[280px] pt-2xl pb-3xl px-xl">
<div className="max-w-container-max mx-auto mt-lg">

{error && <p className="mb-lg text-error font-body-sm bg-error-container/30 px-md py-sm rounded-lg">{error}</p>}

<section className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-2xl">

<Link to="/books" className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col gap-sm hover:shadow-md transition-shadow">
<div className="flex justify-between items-start">
<div className="p-base bg-primary/10 rounded-lg">
<span className="material-symbols-outlined text-primary" data-icon="auto_stories">auto_stories</span>
</div>
<span className="text-label-sm font-label-sm text-on-secondary-fixed-variant">Top genre: {stats.topGenre}</span>
</div>
<div className="mt-md">
<p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Books</p>
<h3 className="font-display-lg text-display-lg text-on-surface">{loading ? "—" : stats.totalVolumes}</h3>
</div>
</Link>

<Link to="/books" className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col gap-sm hover:shadow-md transition-shadow">
<div className="flex justify-between items-start">
<div className="p-base bg-tertiary-fixed-dim/30 rounded-lg">
<span className="material-symbols-outlined text-tertiary" data-icon="check_circle">check_circle</span>
</div>
<span className="text-label-sm font-label-sm text-on-secondary-fixed-variant">{occupancyPct}% on loan</span>
</div>
<div className="mt-md">
<p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Available Books</p>
<h3 className="font-display-lg text-display-lg text-on-surface">{loading ? "—" : availableBooks}</h3>
</div>
</Link>

<Link to="/borrowings" className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col gap-sm hover:shadow-md transition-shadow">
<div className="flex justify-between items-start">
<div className="p-base bg-error-container rounded-lg">
<span className="material-symbols-outlined text-error" data-icon="pending_actions">pending_actions</span>
</div>
<span className="text-label-sm font-label-sm text-error">{stats.members} members</span>
</div>
<div className="mt-md">
<p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Borrowed Books</p>
<h3 className="font-display-lg text-display-lg text-on-surface">{loading ? "—" : stats.activeLoans}</h3>
</div>
</Link>
</section>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">

<section className="lg:col-span-7 bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden">
<div className="px-lg py-md border-b border-surface-variant flex justify-between items-center">
<h4 className="font-headline-md text-headline-md">Recent Activity</h4>
<Link to="/borrowings" className="text-primary font-label-md text-label-md hover:underline">View all</Link>
</div>
<div className="divide-y divide-surface-variant">

{loading ? (
<p className="p-lg text-on-surface-variant font-body-sm">Chargement...</p>
) : recentActivity.length === 0 ? (
<p className="p-lg text-on-surface-variant font-body-sm">Aucune activité récente.</p>
) : (
recentActivity.map((item) => (
<div key={item.id} className="p-lg flex gap-md hover:bg-surface-container-low transition-colors cursor-pointer group">
<div className="w-12 h-16 bg-surface-container rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
{item.cover_url ? (
<img className="w-full h-full object-cover" src={item.cover_url} alt={item.title}/>
) : (
<span className="material-symbols-outlined text-on-surface-variant text-[18px]">menu_book</span>
)}
</div>
<div className="flex-1">
<div className="flex justify-between">
<h5 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">{item.title}</h5>
<span className="text-body-sm text-on-surface-variant">{timeAgo(item.when)}</span>
</div>
<p className="text-body-sm text-on-surface-variant mt-xs">{item.label}</p>
</div>
</div>
))
)}
</div>
</section>

<section className="lg:col-span-5 space-y-lg">
<div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg h-full">
<div className="flex justify-between items-center mb-lg">
<h4 className="font-headline-md text-headline-md">New Arrivals</h4>
<Link to="/books" className="text-primary font-label-md text-label-md hover:underline">View all</Link>
</div>

{loading ? (
<p className="text-on-surface-variant font-body-sm">Chargement...</p>
) : newArrivals.length === 0 ? (
<p className="text-on-surface-variant font-body-sm">Aucun livre pour le moment.</p>
) : (
<div className="grid grid-cols-2 gap-md">
{newArrivals.map((book) => (
<Link to={`/books/${book.id}`} key={book.id} className="group cursor-pointer">
<div className="aspect-[2/3] bg-surface-container rounded-lg overflow-hidden mb-sm border border-transparent group-hover:border-primary transition-all shadow-sm flex items-center justify-center">
{book.cover_url ? (
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={book.cover_url} alt={book.title}/>
) : (
<span className="material-symbols-outlined text-on-surface-variant text-[28px]">menu_book</span>
)}
</div>
<h6 className="font-label-md text-label-md text-on-surface line-clamp-1">{book.title}</h6>
<p className="text-body-sm text-on-surface-variant">{book.author}</p>
</Link>
))}
</div>
)}

<div className="mt-xl p-md bg-primary-fixed/5 rounded-xl border border-primary/10 flex items-center justify-between">
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-widest">Library Goal</span>
<span className="text-body-sm text-on-surface">Target: {goalTarget} books</span>
</div>
<div className="relative w-12 h-12">
<svg className="w-full h-full" viewBox="0 0 36 36">
<path className="stroke-current text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3"></path>
<path className="stroke-current text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray={`${goalPct}, 100`} strokeWidth="3"></path>
</svg>
<span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary">{goalPct}%</span>
</div>
</div>
</div>
</section>
</div>
</div>
</main>

<Link to="/books/new" className="fixed bottom-lg right-lg w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-20 group">
<span className="material-symbols-outlined text-[28px]" data-icon="add">add</span>
<span className="absolute right-16 bg-inverse-surface text-inverse-on-surface px-md py-xs rounded-lg text-label-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Add New Book</span>
</Link>
    </Layout>
  );
}
