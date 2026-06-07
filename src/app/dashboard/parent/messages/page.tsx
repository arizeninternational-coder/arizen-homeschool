export default function ComingSoonPage({ title }: { title?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center bg-white/80 backdrop-blur-sm rounded-[2rem] p-10 max-w-md shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-white/60">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🚧</span>
        </div>
        <h2 className="text-xl font-extrabold text-text mb-2">{title || "Coming Soon"}</h2>
        <p className="text-sm text-text-muted">This feature is being built. Check back soon!</p>
      </div>
    </div>
  );
}
