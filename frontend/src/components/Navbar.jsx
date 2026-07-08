export default function Navbar({ title, subtitle, navItems, activePage, onNavigate, onLogout }) {
  return (
    <header className="mb-5 flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-4 shadow-glow backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
          CampusPulse
        </div>
        <h2 className="mt-3 text-2xl font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
      </div>

      <nav className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <button key={item.key} type="button" className={activePage === item.key ? 'rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950' : 'rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10'} onClick={() => onNavigate(item.key)}>
            {item.label}
          </button>
        ))}
        <button type="button" className="rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20" onClick={onLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
}