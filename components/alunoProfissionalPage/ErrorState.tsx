interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">{message}</p>
        </div>
        <p className="text-text-primary/70 text-sm">A redirecionar...</p>
      </div>
    </div>
  );
}
