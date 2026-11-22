import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import ProductRange from "@/pages/ProductRange";
import { Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import { CartDrawer } from "./components/CartDrawer";
import ErrorBoundary from "./components/ErrorBoundary";
import { CartProvider } from "./contexts/CartContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function ScrollManager() {
  const [location] = useLocation();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash) {
      requestAnimationFrame(() => {
        const target = document.getElementById(hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
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
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </CartProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
