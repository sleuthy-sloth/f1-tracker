"use client";

import { Button } from "@/components/ui/Button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ArchiveError({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="text-center max-w-md">
        <h2 className="font-heading text-2xl font-bold text-f1-white mb-4">
          Something went wrong
        </h2>
        <p className="text-f1-silver mb-6">
          Unable to load the race archive. Please try again.
        </p>
        <Button onClick={reset} variant="primary">
          Try Again
        </Button>
      </div>
    </div>
  );
}