'use client';

import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, AlertTriangle, XCircle } from 'lucide-react';

interface ErrorBannerProps {
  failedChains: string[];
  onRetry: (chains: string[]) => void;
  variant?: 'warning' | 'error';
}

export function ErrorBanner({
  failedChains,
  onRetry,
  variant = 'warning'
}: ErrorBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (failedChains.length === 0) {
    return null;
  }

  // Full error state when ALL chains fail (per CONTEXT.md)
  if (variant === 'error') {
    return (
      <div className="w-full max-w-lg">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Scan Failed</AlertTitle>
          <AlertDescription className="mt-2">
            <p>Unable to fetch transaction data. This could be due to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Network connectivity issues</li>
              <li>API service unavailable</li>
              <li>Invalid API key</li>
            </ul>
            <Button
              onClick={() => onRetry(failedChains)}
              className="mt-4"
              variant="outline"
            >
              Retry All Chains
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Collapsible warning banner per CONTEXT.md
  return (
    <div className="w-full max-w-lg">
      <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="flex items-center justify-between">
          <span>{failedChains.length} chain{failedChains.length !== 1 ? 's' : ''} failed</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </AlertTitle>

        {/* Expandable list of failed chains per CONTEXT.md */}
        {isExpanded && (
          <AlertDescription className="mt-2">
            <ul className="text-sm space-y-1">
              {failedChains.map((chain) => (
                <li key={chain} className="text-muted-foreground">{chain}</li>
              ))}
            </ul>
            <Button
              onClick={() => onRetry(failedChains)}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Retry Failed Chains
            </Button>
          </AlertDescription>
        )}
      </Alert>
    </div>
  );
}
