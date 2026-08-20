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
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5211/hub/medsim") // Adjust URL to match your backend port
      .withAutomaticReconnect()
      .build();

    connection.on("LeaderboardUpdated", () => {
      console.log("Leaderboard update received via SignalR. Invalidating cache...");
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
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
