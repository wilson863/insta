import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Search, PlusSquare, Heart, User, LogOut } from "lucide-react";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MainLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe({
    query: {
      retry: false,
    },
  });
  const logout = useLogout();

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setLocation("/login");
      },
    });
  };

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Explore", href: "/explore" },
    { icon: PlusSquare, label: "Create", href: "/create" },
    { icon: Heart, label: "Notifications", href: "#", disabled: true },
    { icon: User, label: "Profile", href: `/profile/${user.username}` },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[250px] lg:w-[280px] border-r border-border fixed h-screen p-4 bg-card z-50">
        <div className="py-6 px-4 mb-4">
          <Link href="/">
            <h1 className="text-2xl font-bold font-display cursor-pointer hover:opacity-80 transition-opacity">
              <span className="instaclone-gradient-text">InstaClone</span>
            </h1>
          </Link>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            if (item.disabled) {
              return (
                <div key={item.label} className="flex items-center gap-4 px-4 py-3 rounded-lg text-muted-foreground opacity-50 cursor-not-allowed">
                  <Icon className="w-6 h-6" />
                  <span className="font-medium text-lg hidden lg:block">{item.label}</span>
                </div>
              );
            }
            
            return (
              <Link key={item.label} href={item.href} className="block">
                <div className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer ${isActive ? "font-bold text-primary" : "font-medium"}`}>
                  <Icon className={`w-6 h-6 ${isActive ? "text-primary" : ""}`} />
                  <span className="text-lg hidden lg:block">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <Avatar className="w-8 h-8 border border-border">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 hidden lg:block">
              <p className="text-sm font-bold truncate">{user.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user.fullName}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-4 px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="w-6 h-6" />
            <span className="font-medium text-lg hidden lg:block">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[250px] lg:ml-[280px] pb-16 md:pb-0">
        <div className="max-w-[800px] mx-auto w-full min-h-screen p-0 sm:p-4">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-card border-t border-border flex items-center justify-around p-3 z-50 safe-area-bottom">
        {navItems.map((item) => {
          if (item.disabled) return null;
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href}>
              <div className="p-2 flex flex-col items-center justify-center cursor-pointer">
                <Icon className={`w-7 h-7 ${isActive ? "text-primary" : "text-foreground"}`} />
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
