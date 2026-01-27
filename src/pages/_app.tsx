import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Geist } from "next/font/google";
import AppShell from "@/components/AppShell";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import "@/styles/globals.css";

function AuthGate({
  children,
  isLogin,
}: {
  children: React.ReactNode;
  isLogin: boolean;
}) {
  const router = useRouter();
  const { status } = useSession();

  if (status === "unauthenticated" && !isLogin) {
    void router.push("/login");
    return null;
  }

  return <>{children}</>;
}

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  const isLogin = router.pathname === "/login";

  return (
    <SessionProvider session={session}>
      <AuthGate isLogin={isLogin}>
        {isLogin ? (
          <Component {...pageProps} />
        ) : (
          <AppShell>
            <Component {...pageProps} />
          </AppShell>
        )}
      </AuthGate>
    </SessionProvider>
  );
};
export default api.withTRPC(MyApp);
