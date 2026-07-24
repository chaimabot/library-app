import Sidebar from "./Sidebar";

export default function Layout({ active, children }) {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar active={active} />
      {children}
    </div>
  );
}
