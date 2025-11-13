import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import "../styles/globals.css";

function SessionCacheSync() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const previousUserRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (status === "loading") return;

    const currentUserId = session?.user?.id ?? null;

    // Jeżeli użytkownik się zmienił lub wylogował, czyścimy cache
    if (previousUserRef.current !== currentUserId) {
      queryClient.clear();
      previousUserRef.current = currentUserId;
    }
  }, [session, status, queryClient]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const { session, ...restPageProps } = pageProps || {};
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minut
          },
        },
      })
  );

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SessionCacheSync />
            <Component {...restPageProps} />
            <Toaster position="bottom-right" mobileOffset={"30px"} />
          </ThemeProvider>
        </SessionProvider>
      </QueryClientProvider>
    </>
  );
}
