export function LoadingState() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow mx-auto"></div>
        <p className="text-text-primary/70 mt-4">A carregar...</p>
      </div>
    </div>
  );
}
