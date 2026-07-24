import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../api/client";

export default function AddEditBook() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    description: "",
    cover_url: "",
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [coverProcessing, setCoverProcessing] = useState(false);
  const [coverWarning, setCoverWarning] = useState(null);

  const MAX_DIMENSION = 800;
  const JPEG_QUALITY = 0.82;

  useEffect(() => {
    if (!isEditing) return;
    api.books
      .get(id)
      .then((book) =>
        setForm({
          title: book.title || "",
          author: book.author || "",
          isbn: book.isbn || "",
          category: book.category || "",
          description: book.description || "",
          cover_url: book.cover_url || "",
        })
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleHeaderSearch(e) {
    if (e.key !== "Enter") return;
    const q = e.target.value.trim();
    navigate(q ? `/books?q=${encodeURIComponent(q)}` : "/books");
  }

  function handleCoverFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverWarning(null);
    setCoverProcessing(true);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

        if (dataUrl.length > 2_000_000) {
          setCoverWarning("Cette image reste volumineuse même après compression. Essayez une image plus légère.");
        }
        update("cover_url", dataUrl);
        setCoverProcessing(false);
      };
      img.onerror = () => {
        setCoverWarning("Impossible de lire cette image.");
        setCoverProcessing(false);
      };
      img.src = reader.result;
    };
    reader.onerror = () => {
      setCoverWarning("Impossible de lire ce fichier.");
      setCoverProcessing(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.author) {
      setError("Le titre et l'auteur sont requis.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      if (isEditing) {
        await api.books.update(id, form);
        navigate(`/books/${id}`);
      } else {
        const created = await api.books.create(form);
        navigate(`/books/${created.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
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
<header className="fixed top-0 right-0 left-[280px] h-16 bg-surface-container-lowest border-b border-surface-variant flex justify-between items-center px-lg z-40">
<div className="flex items-center">
<h1 className="font-headline-md text-headline-md font-bold text-primary mr-xl">Libris</h1>
<div className="relative flex-1 min-w-0 max-w-[220px] sm:max-w-xs hidden md:block">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
<input className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-1.5 text-body-sm focus:ring-2 focus:ring-primary w-full transition-all" placeholder="Search collection..." type="text" onKeyDown={handleHeaderSearch}/>
</div>
</div>
<div className="flex items-center gap-md">
<button className="hover:bg-surface-container-high rounded-full p-2 text-on-surface-variant transition-colors relative">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
</button>
<button className="hover:bg-surface-container-high rounded-full p-2 text-on-surface-variant transition-colors">
<span className="material-symbols-outlined">settings</span>
</button>
<div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border border-outline-variant">
<img className="w-full h-full object-cover" data-alt="A professional studio headshot of a person with a warm expression, wearing a neutral-toned sweater. The background is a soft, out-of-focus library with shelves of books and warm ambient lighting. The overall style is clean, modern, and high-quality, fitting a sophisticated knowledge management application." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwZ5RmjTJ8rZv6YbLOO8gJxvDvBRP2qOwHYUTFjDElbbW0-XL5rmBicRXwY0wXG86mEF-7AdAh5nh74UraeZ7d2OnDVemJ3PMw1_XiBl8tIqmPNUbD95dJdi1Rbxvzh8YaVN5yrmCXEgQ6x_-GQc7Rk42L7fRWDkvsS75HS95WcMgbq05QA2SZEwdkCN0o3BHSrHigWpThWCzm0i95g83Rc64ASRTnFI-7FCCAKj7s0QAwOLr4c7oo"/>
</div>
</div>
</header>

<main className="ml-[280px] pt-16 min-h-screen">
<div className="max-w-container-max mx-auto px-lg py-xl">

<nav className="flex items-center gap-sm mb-lg text-on-surface-variant">
<Link to="/books" className="font-label-sm text-label-sm hover:text-primary transition-colors">Collection</Link>
<span className="material-symbols-outlined text-[12px]">chevron_right</span>
<span className="font-label-sm text-label-sm text-on-surface font-semibold">{isEditing ? "Edit Book" : "New Entry"}</span>
</nav>
<div className="flex flex-col lg:flex-row gap-xl">

<div className="flex-grow max-w-4xl bg-surface-container-lowest border border-surface-variant rounded-xl p-xl shadow-sm">
<div className="mb-xl">
<h2 className="font-headline-lg text-headline-lg text-on-surface">{isEditing ? "Edit Book" : "Book Details"}</h2>
<p className="font-body-md text-body-md text-on-surface-variant">{isEditing ? "Update the information for this title." : "Enter the information to categorize this title in your knowledge base."}</p>
</div>
<form className="space-y-lg" onSubmit={handleSubmit}>
{error && <p className="text-error font-body-sm bg-error-container/30 px-md py-sm rounded-lg">{error}</p>}
<div className="grid grid-cols-1 md:grid-cols-2 gap-lg">

<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md text-on-surface" htmlFor="title">Book Title</label>
<input className="w-full border border-surface-variant rounded-lg px-md py-sm font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface-bright placeholder:text-on-surface-variant/40" id="title" name="title" placeholder="e.g. The Republic" type="text" value={form.title} onChange={(e) => update("title", e.target.value)}/>
</div>

<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md text-on-surface" htmlFor="author">Author</label>
<input className="w-full border border-surface-variant rounded-lg px-md py-sm font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface-bright placeholder:text-on-surface-variant/40" id="author" name="author" placeholder="e.g. Plato" type="text" value={form.author} onChange={(e) => update("author", e.target.value)}/>
</div>
</div>

<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md text-on-surface" htmlFor="isbn">ISBN</label>
<input className="w-full border border-surface-variant rounded-lg px-md py-sm font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface-bright placeholder:text-on-surface-variant/40" id="isbn" name="isbn" placeholder="e.g. 978-0000000000" type="text" value={form.isbn} onChange={(e) => update("isbn", e.target.value)}/>
</div>

<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md text-on-surface" htmlFor="category">Category</label>
<div className="relative">
<select className="w-full appearance-none border border-surface-variant rounded-lg px-md py-sm font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface-bright" id="category" name="category" value={form.category} onChange={(e) => update("category", e.target.value)}>
<option value="">Select a category</option>
<option value="Philosophy">Philosophy</option>
<option value="Science">Science</option>
<option value="History">History</option>
<option value="Literature">Literature</option>
<option value="Fantasy">Fantasy</option>
<option value="Sci-Fi">Sci-Fi</option>
<option value="Technology">Technology</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
</div>
</div>

<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md text-on-surface" htmlFor="cover_url">Cover Image</label>
<div className="flex flex-col sm:flex-row gap-md">
<input className="w-full border border-surface-variant rounded-lg px-md py-sm font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface-bright placeholder:text-on-surface-variant/40" id="cover_url" name="cover_url" placeholder="https://... or upload a file" type="text" value={form.cover_url.startsWith("data:") ? "" : form.cover_url} onChange={(e) => update("cover_url", e.target.value)}/>
<label className="shrink-0 inline-flex items-center justify-center gap-xs px-md py-sm rounded-lg border border-surface-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-high cursor-pointer transition-colors">
<span className="material-symbols-outlined text-[18px]">upload</span>
Upload
<input type="file" accept="image/*" className="hidden" onChange={handleCoverFile}/>
</label>
{form.cover_url && (
<button type="button" className="shrink-0 px-md py-sm rounded-lg border border-error/20 text-error font-label-md text-label-md hover:bg-error-container/30 transition-colors" onClick={() => update("cover_url", "")}>
Remove
</button>
)}
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">
{coverProcessing ? "Optimisation de l'image..." : "Paste an image URL, or upload a cover from your computer (auto-compressed)."}
</p>
{coverWarning && <p className="font-body-sm text-body-sm text-error">{coverWarning}</p>}
</div>

<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md text-on-surface" htmlFor="description">Description / Notes</label>
<textarea className="w-full border border-surface-variant rounded-lg px-md py-sm font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface-bright resize-none placeholder:text-on-surface-variant/40" id="description" name="description" placeholder="Brief summary or personal annotations..." rows="6" value={form.description} onChange={(e) => update("description", e.target.value)}></textarea>
</div>

<div className="flex items-center justify-end gap-md pt-lg border-t border-surface-variant mt-xl">
<button className="px-xl py-sm rounded-lg font-label-md text-label-md text-on-secondary-fixed-variant hover:bg-surface-container-high transition-colors active:scale-95 duration-150" type="button" onClick={() => navigate(isEditing ? `/books/${id}` : "/books")}>
                                Cancel
                            </button>
<button className="px-xl py-sm rounded-lg font-label-md text-label-md bg-primary text-on-primary shadow-sm hover:bg-primary-container transition-colors active:scale-95 duration-150 disabled:opacity-60" type="submit" disabled={saving || coverProcessing}>
                                {saving ? "Saving..." : isEditing ? "Update Book" : "Save Book"}
                            </button>
</div>
</form>
</div>

<aside className="hidden xl:block w-80 space-y-lg">
<div className="bg-surface-container rounded-xl p-lg border border-surface-variant">
<div className="flex items-center gap-sm mb-md text-primary">
<span className="material-symbols-outlined text-md">info</span>
<h3 className="font-label-md text-label-md uppercase tracking-wider">Metadata Tips</h3>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                            Accurate categorization helps the knowledge engine surface related titles during your deep research sessions. Consider adding primary themes in the description.
                        </p>
</div>
<div className="rounded-xl overflow-hidden border border-surface-variant relative">
<div className="aspect-[2/3] bg-surface-container flex items-center justify-center">
{form.cover_url ? (
<img className="w-full h-full object-cover" src={form.cover_url} alt={form.title || "Cover preview"}/>
) : (
<div className="flex flex-col items-center gap-xs text-on-surface-variant">
<span className="material-symbols-outlined text-[40px]">menu_book</span>
<span className="font-label-sm text-label-sm">No cover yet</span>
</div>
)}
</div>
<div className="p-md bg-surface-container-lowest">
<p className="font-label-md text-label-md text-on-surface truncate">{form.title || "Untitled book"}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant truncate">{form.author || "Unknown author"}</p>
</div>
</div>
</aside>
</div>
</div>
</main>
    </Layout>
  );
}
