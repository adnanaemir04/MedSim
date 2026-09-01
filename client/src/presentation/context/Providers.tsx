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

    // Determine the optimal SignalR hub URL
    const getHubUrl = () => {
      if (process.env.NEXT_PUBLIC_API_URL) {
        return `${process.env.NEXT_PUBLIC_API_URL}/hub/medsim`;
      }
      if (typeof window !== 'undefined') {
        // If frontend is accessed via port 3000 (Docker or local Next.js), backend is mapped directly to 5211
        if (window.location.port === '3000') {
          return `${window.location.protocol}//${window.location.hostname}:5211/hub/medsim`;
        }
        return `${window.location.origin}/hub/medsim`;
      }
      return '/hub/medsim';
    };

    const hubUrl = getHubUrl();
    console.log("[SignalR] Connecting to:", hubUrl);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          if (typeof window !== 'undefined') {
            return localStorage.getItem('medsim_access_token') || "";
          }
          return "";
        },
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
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

    connection.on("FeedbackReceived", (data) => {
      console.log("FeedbackReceived via SignalR:", data);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('FeedbackReceived', { detail: data }));
        window.dispatchEvent(new Event('AdminDataUpdated'));
      }
    });

    connection.start()
      .then(() => {
        if (isMounted) {
          console.log("[SignalR] Successfully Connected!");
        }
      })
      .catch(err => {
        if (isMounted) {
          console.warn("[SignalR] Initial connection attempt with direct port failed, trying fallback /hub/medsim:", err);
          // Fallback connection to relative endpoint
          const fallbackConnection = new signalR.HubConnectionBuilder()
            .withUrl("/hub/medsim")
            .withAutomaticReconnect()
            .build();
            
          fallbackConnection.on("AdminDataUpdated", () => {
            window.dispatchEvent(new Event('AdminDataUpdated'));
          });
          fallbackConnection.on("LeaderboardUpdated", () => {
            queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'leaderboard' });
          });
          fallbackConnection.start().catch(e => console.error("[SignalR] Fallback error:", e));
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
