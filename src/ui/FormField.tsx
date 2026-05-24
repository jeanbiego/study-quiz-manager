import type { InputHTMLAttributes, PropsWithChildren, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type FieldProps = PropsWithChildren<{
  label: string;
  hint?: string;
}>;

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      {children}
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-700" {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-700" {...props} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-700" {...props} />;
}
