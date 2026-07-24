import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../api/client";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [activeBorrowing, setActiveBorrowing] = useState(null);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [working, setWorking] = useState(false);

  function loadBook() {
    api.books
      .get(id)
      .then(setBook)
      .catch((err) => setError(err.message));
  }

  function loadActiveBorrowing() {
    api.borrowings
      .list({ status: "Active" })
      .then((data) => setActiveBorrowing(data.find((b) => String(b.book_id) === id) || null))
      .catch(() => {});
  }

  useEffect(() => {
    loadBook();
    loadActiveBorrowing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Supprimer "${book.title}" de la bibliothèque ?`)) return;
    try {
      await api.books.remove(id);
      navigate("/books");
    } catch (err) {
      setActionError(err.message);
    }
  }

  function handleHeaderSearch(e) {
    if (e.key !== "Enter") return;
    const q = e.target.value.trim();
    navigate(q ? `/books?q=${encodeURIComponent(q)}` : "/books");
  }

  async function handleReturn() {
    if (!activeBorrowing) return;
    try {
      setWorking(true);
      setActionError(null);
      await api.borrowings.return(activeBorrowing.id);
      loadBook();
      loadActiveBorrowing();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setWorking(false);
    }
  }

  if (error) {
    return (
      <Layout active="books">
        <main className="ml-[280px] pt-16 min-h-screen flex items-center justify-center">
          <p className="text-error font-body-md">{error}</p>
        </main>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout active="books">
        <main className="ml-[280px] pt-16 min-h-screen flex items-center justify-center">
          <p className="text-on-surface-variant font-body-md">Chargement...</p>
        </main>
      </Layout>
    );
  }

  return (
    <Layout active="books">
<header className="fixed top-0 right-0 left-[280px] h-16 bg-surface-container-lowest flex justify-between items-center px-lg border-b border-surface-variant z-10 gap-md">
<div className="flex items-center gap-md shrink-0">
<Link to="/books" className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-high rounded-full p-2">arrow_back</Link>
<h2 className="font-headline-md text-headline-md font-bold text-primary">Book Details</h2>
</div>
<div className="flex items-center gap-lg min-w-0 justify-end">
<div className="relative flex-1 min-w-0 max-w-[220px] sm:max-w-xs hidden md:block">
<input className="bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 w-full text-body-sm focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" placeholder="Search knowledge base..." type="text" onKeyDown={handleHeaderSearch}/>
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
</div>
<div className="flex items-center gap-sm">
<span className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-high rounded-full p-2 cursor-pointer transition-all">notifications</span>
<span className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-high rounded-full p-2 cursor-pointer transition-all">settings</span>
<div className="w-8 h-8 rounded-full overflow-hidden ml-2 border border-surface-variant">
<img className="w-full h-full object-cover" data-alt="A clean, professional close-up headshot of a person with a friendly expression, styled htmlFor a corporate or professional knowledge management platform profile. The background is a soft, out-of-focus office environment with neutral tones and plenty of light. The aesthetic is modern and minimalist with high clarity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTFjfOq0jR-ZWeZ5lam9DZ9hbTS-EtJT67yEoYMSw1vV9ethLt6TF_CF5DhJYTAy_YvY70SvYzcRDRhAPM7Nedbvt9gwwoEgmz5fXE7jN6eBLnrdQ1VyfN076NLxhdA5wMFzHUc2MA_PMPy2Zq7qspqeAPmLPNpwS46hEtwpKIrUDrVQOF3h8E4toHKJiP1LCFdSNQuyUBMW33VDE5B08htDB_WBBXZQAWIvcl09RfvTkrKsyt1cPs"/>
</div>
</div>
</div>
</header>

<main className="ml-[280px] pt-16 min-h-screen bg-background">
<div className="max-w-[1280px] mx-auto p-2xl">

<nav className="flex items-center gap-xs text-on-surface-variant mb-lg">
<Link to="/books" className="font-label-md text-label-md cursor-pointer hover:text-primary">Books</Link>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
<span className="font-label-md text-label-md cursor-pointer hover:text-primary">{book.category || "—"}</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
<span className="font-label-md text-label-md text-on-surface">{book.title}</span>
</nav>

<div className="grid grid-cols-12 gap-lg">

<div className="col-span-12 lg:col-span-4 space-y-lg">
<div className="glass-card rounded-xl p-md shadow-sm aspect-[2/3] overflow-hidden group bg-surface-container flex items-center justify-center">
{book.cover_url ? (
<img className="w-full h-full object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-500" src={book.cover_url} alt={book.title}/>
) : (
<div className="flex flex-col items-center gap-sm text-on-surface-variant">
<span className="material-symbols-outlined text-[56px]">menu_book</span>
<span className="font-label-sm text-label-sm">No cover available</span>
</div>
)}
</div>
<div className="flex flex-col gap-sm">
{actionError && <p className="text-error font-body-sm bg-error-container/30 px-md py-sm rounded-lg">{actionError}</p>}
{book.status === "Available" ? (
<button
  className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg shadow-md hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-sm"
  onClick={() => navigate(`/borrowings/new?book=${id}`)}
>
<span className="material-symbols-outlined">shopping_cart</span>
                            Borrow Book
                        </button>
) : (
<button
  className="w-full bg-surface-container-lowest text-primary border border-primary/20 font-label-md text-label-md py-3 rounded-lg hover:bg-surface-container-high transition-all active:scale-[0.98] flex items-center justify-center gap-sm disabled:opacity-60"
  onClick={handleReturn}
  disabled={working || !activeBorrowing}
>
<span className="material-symbols-outlined">assignment_return</span>
                            {working ? "Processing..." : "Return Book"}
                        </button>
)}
<Link
  to={`/books/${id}/edit`}
  className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant font-label-md text-label-md py-3 rounded-lg hover:bg-surface-container-high transition-all active:scale-[0.98] flex items-center justify-center gap-sm"
>
<span className="material-symbols-outlined">edit</span>
                            Edit Book
                        </Link>
<button
  className="w-full bg-surface-container-lowest text-error border border-error/20 font-label-md text-label-md py-3 rounded-lg hover:bg-error-container/30 transition-all active:scale-[0.98] flex items-center justify-center gap-sm"
  onClick={handleDelete}
>
<span className="material-symbols-outlined">delete</span>
                            Delete Book
                        </button>
</div>
<div className="glass-card rounded-xl p-lg space-y-md">
<h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Lending Status</h4>
<div className="flex items-start gap-md">
<span className="material-symbols-outlined text-tertiary-container mt-1">info</span>
{activeBorrowing ? (
<p className="font-body-sm text-body-sm text-on-secondary-fixed-variant">
Currently borrowed by <span className="font-semibold">{activeBorrowing.member_name}</span>, due back on {activeBorrowing.due_date}.
</p>
) : (
<p className="font-body-sm text-body-sm text-on-secondary-fixed-variant">This copy is available and ready to be borrowed.</p>
)}
</div>
</div>
</div>

<div className="col-span-12 lg:col-span-8 space-y-lg">
<div className="glass-card rounded-xl p-xl shadow-sm">
<div className="flex justify-between items-start mb-md">
<div>
<div className="flex items-center gap-md mb-xs">
<span className="bg-secondary-container text-on-secondary-container px-sm py-[2px] rounded text-label-sm font-label-sm uppercase tracking-wide">{book.category || "Livre"}</span>
<div className={"flex items-center gap-xs " + (book.status === "Available" ? "text-green-600" : "text-error")}>
<span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>{book.status === "Available" ? "check_circle" : "schedule"}</span>
<span className="font-label-sm text-label-sm">{book.status}</span>
</div>
</div>
<h3 className="font-display-lg text-display-lg text-on-surface mb-xs">{book.title}</h3>
<p className="font-headline-md text-headline-md text-on-surface-variant">by {book.author}</p>
</div>
<div className="flex gap-sm">
<button className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant">
<span className="material-symbols-outlined">favorite</span>
</button>
<button className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant">
<span className="material-symbols-outlined">share</span>
</button>
</div>
</div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-lg py-xl border-y border-surface-variant my-xl">
<div className="space-y-xs">
<span className="text-label-sm font-label-sm text-on-surface-variant uppercase">ISBN</span>
<p className="font-body-md text-body-md font-semibold">{book.isbn || "—"}</p>
</div>
<div className="space-y-xs">
<span className="text-label-sm font-label-sm text-on-surface-variant uppercase">Category</span>
<p className="font-body-md text-body-md font-semibold">{book.category || "—"}</p>
</div>
<div className="space-y-xs">
<span className="text-label-sm font-label-sm text-on-surface-variant uppercase">Status</span>
<p className="font-body-md text-body-md font-semibold">{book.status}</p>
</div>
<div className="space-y-xs">
<span className="text-label-sm font-label-sm text-on-surface-variant uppercase">Added</span>
<p className="font-body-md text-body-md font-semibold">{book.created_at ? book.created_at.split(" ")[0] : "—"}</p>
</div>
</div>
<div className="space-y-md">
<h4 className="font-headline-md text-headline-md text-on-surface">Description</h4>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                                {book.description || "Aucune description disponible pour ce livre."}
                            </p>
</div>
{book.category && (
<div className="mt-2xl flex flex-wrap gap-sm">
<span className="bg-[#EEF2FF] text-primary px-md py-sm rounded-full text-label-sm font-label-sm">{book.category}</span>
</div>
)}
</div>

<div className="glass-card rounded-xl p-lg flex items-center gap-lg">
<div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-surface-container-high flex items-center justify-center">
<span className="material-symbols-outlined text-on-surface-variant text-[28px]">person</span>
</div>
<div>
<h5 className="font-headline-md text-headline-md">{book.author}</h5>
<p className="font-body-sm text-body-sm text-on-surface-variant">Author of "{book.title}"</p>
</div>
</div>
</div>
</div>
</div>
</main>
    </Layout>
  );
}
