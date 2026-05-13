import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { UserMenu } from "./UserMenu";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function Navbar() {
  const t = await getTranslations("nav");
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-plum-100/60 bg-cream/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo className="h-9 w-9 transition group-hover:rotate-[-12deg] group-hover:scale-110" />
          <span className="font-display text-xl font-bold text-plum-800">BezEkrana</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/about" className="hidden md:inline text-sm font-bold text-plum-700 hover:text-coral-600">
            {t("about")}
          </Link>
          {user ? (
            <UserMenu
              email={user.email}
              fullName={user.fullName}
              isAdmin={user.isAdmin}
            />
          ) : (
            <>
              <Link href="/login">
                <Button variant="plum" size="sm">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  {t("register")}
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
