interface LoadingProps {
  label?: string;
}

export const Loading = ({ label = 'Cargando…' }: LoadingProps) => (
  <div role="status" className="flex items-center gap-3 py-10 text-sm text-ink/60">
    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-court motion-reduce:animate-none" />
    {label}
  </div>
);
