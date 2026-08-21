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
        staleTime: 60 * 1000, // 1 minute
      },
    },
  }));

  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    // Prevent double-start in React StrictMode
    if (connectionRef.current) return;

    let isMounted = true;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5211';
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hub/medsim`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.on('LeaderboardUpdated', () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'leaderboard' });
    });

    connection.start()
      .then(() => { if (isMounted) console.log('SignalR Connected.'); })
      .catch(err => { if (isMounted) console.warn('SignalR not available:', err.message); });

    return () => {
      isMounted = false;
      connectionRef.current = null;
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
