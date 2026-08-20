'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { ThemeProvider } from './ThemeContext';
import * as signalR from '@microsoft/signalr';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000, // 1 minute
      },
    },
  }));

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5211";
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hub/medsim`)
      .withAutomaticReconnect()
      .build();

    connection.on("LeaderboardUpdated", () => {
      console.log("Leaderboard update received via SignalR. Invalidating cache...");
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'leaderboard' });
    });

    connection.start()
      .then(() => console.log("SignalR Connected."))
      .catch(err => console.error("SignalR Connection Error: ", err));

    return () => {
      connection.stop();
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
