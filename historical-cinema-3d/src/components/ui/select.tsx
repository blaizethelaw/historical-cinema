import * as React from "react";

type SelectContext = { value?: string; setValue?: (v: string) => void };
const Ctx = React.createContext<SelectContext>({});

type RootProps = { value?: string; onValueChange?: (v: string) => void; children: React.ReactNode };
export function Select({ value, onValueChange, children }: RootProps) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => setV(value), [value]);
  return <Ctx.Provider value={{ value: v, setValue: (x) => { setV(x); onValueChange?.(x); } }}>{children}</Ctx.Provider>;
}

export function SelectTrigger({ className = "", children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 ${className}`} {...rest}>{children}</div>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(Ctx);
  return <span className="truncate text-sm text-white/90">{value ?? placeholder ?? "Select"}</span>;
}

export function SelectContent({ children, className = "" }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`mt-2 rounded-xl border border-white/10 bg-black/60 p-1 ${className}`}>{children}</div>;
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const { setValue } = React.useContext(Ctx);
  return (
    <button type="button" onClick={() => setValue?.(value)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10">
      {children}
    </button>
  );
}
