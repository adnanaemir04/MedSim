'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from './ThemeContext';
import * as signalR from '@microsoft/signalr';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
      },
    },
  }));

  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Reuse existing connection if StrictMode re-mounts
    if (connectionRef.current) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hub/medsim`)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.on("LeaderboardUpdated", () => {
      console.log("Leaderboard update received via SignalR. Invalidating cache...");
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'leaderboard' });
    });

    connection.on("AdminDataUpdated", () => {
      console.log("AdminDataUpdated received via SignalR. Dispatching event...");
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('AdminDataUpdated'));
      }
    });

    connection.start()
      .then(() => {
        if (isMounted) {
          console.log("SignalR Connected.");
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("SignalR Connection Error: ", err);
        }
      });

    return () => {
      isMounted = false;
      // Don't stop on StrictMode unmount — connection persists in ref
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
