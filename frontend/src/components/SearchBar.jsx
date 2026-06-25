export default function SearchBar({ value, onChange, placeholder = 'Search by commit or branch' }) {
  return (
    <div className="w-full max-w-xl">
      <label htmlFor="search" className="mb-2 block text-sm text-slate-400">
        Search by commit or branch
      </label>
      <input
        id="search"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
      />
    </div>
  );
}
