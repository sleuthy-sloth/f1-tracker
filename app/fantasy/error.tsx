"use client";

import { Button } from "@/components/ui/Button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function FantasyError({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="text-center max-w-md">
        <h2 className="font-heading text-2xl font-bold text-f1-white mb-4">
          Unable to load fantasy data
        </h2>
        <p className="text-f1-silver mb-6">
          Could not fetch driver information. Your team data is safe.
        </p>
        <Button onClick={reset} variant="primary">
          Try Again
        </Button>
      </div>
    </div>
  );
}