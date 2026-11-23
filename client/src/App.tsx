import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import ProductRange from "@/pages/ProductRange";
import { Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import { CartDrawer } from "./components/CartDrawer";
import ErrorBoundary from "./components/ErrorBoundary";
import { QuickAddModal } from "./components/QuickAddModal";
import { WishlistDrawer } from "./components/WishlistDrawer";
import { CartProvider } from "./contexts/CartContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import Home from "./pages/Home";

function ScrollManager() {
  const [location] = useLocation();

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash) {
        requestAnimationFrame(() => {
          const target = document.getElementById(hash);
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
          }
        });
        return true;
      }
      return false;
    };

    if (!scrollToHash()) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, [location]);

  return null;
}

function Router() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <ScrollManager />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products/:slug" component={ProductRange} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
      <CartDrawer />
      <WishlistDrawer />
      <QuickAddModal />
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <CartProvider>
            <WishlistProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </WishlistProvider>
          </CartProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
