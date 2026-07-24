import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: "home", to: "/" },
  { key: "books", label: "Books", icon: "menu_book", to: "/books" },
  { key: "members", label: "Members", icon: "group", to: "/members" },
  {
    key: "borrowings",
    label: "Borrowings",
    icon: "assignment_return",
    to: "/borrowings",
  },
  { key: "profile", label: "Profile", icon: "person", to: "/profile" },
];

export default function Sidebar({ active }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-surface-container-lowest border-r border-surface-variant flex flex-col h-full py-lg z-50">
      <div className="px-lg mb-xl">
        <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
          Libris
        </h1>
        <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70">
          Knowledge Manager
        </p>
      </div>
      <nav className="flex-1 space-y-base px-md">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              to={item.to}
              className={
                "flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md active:scale-95 transition-transform duration-150 transition-colors " +
                (isActive
                  ? "text-primary border-l-4 border-primary bg-primary-fixed/10"
                  : "text-on-secondary-fixed-variant hover:bg-surface-container-high")
              }
            >
              <span
                className="material-symbols-outlined"
                style={
                  isActive ? { fontVariationSettings: "'FILL' 1" } : undefined
                }
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-md mt-auto">
        {user && (
          <div className="flex items-center gap-md px-md py-sm mb-xs">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-surface-variant"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-surface-variant">
                <span className="material-symbols-outlined text-primary">
                  person
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-label-md text-label-md text-on-surface truncate">
                {user.name}
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant truncate">
                {user.role || "User"}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center gap-md px-md py-sm rounded-lg text-on-secondary-fixed-variant hover:bg-surface-container-high transition-colors font-label-md text-label-md"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
