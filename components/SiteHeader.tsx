"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { trackCtaClick } from "@/lib/analytics";
import BrandMark from "@/components/BrandMark";

export default function SiteHeader({
  mode = "content",
}: {
  mode?: "home" | "content";
}) {
  const pathname = usePathname() || "/";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/guides") {
      return pathname === "/guides" || pathname.startsWith("/guides/");
    }
    return pathname === href;
  };

  const desktopLinks =
    mode === "home"
      ? [
          { href: "/how-it-works", label: "How it works", isAnchor: false },
          { href: "#demo", label: "Sample scan", isAnchor: true },
          { href: "#pricing", label: "Pricing", isAnchor: true },
          { href: "/help", label: "Help Center", isAnchor: false },
          { href: "/guides", label: "Guides", isAnchor: false },
        ]
      : [
          { href: "/", label: "Home", isAnchor: false },
          { href: "/how-it-works", label: "How it works", isAnchor: false },
          { href: "/help", label: "Help Center", isAnchor: false },
          { href: "/guides", label: "Guides", isAnchor: false },
          { href: "/faq", label: "FAQ", isAnchor: false },
        ];

  const mobileLinks =
    mode === "home"
      ? [
          { href: "/how-it-works", label: "How it works", isAnchor: false },
          { href: "#demo", label: "Sample scan", isAnchor: true },
          { href: "#pricing", label: "Pricing", isAnchor: true },
          { href: "/help", label: "Help Center", isAnchor: false },
          { href: "/guides", label: "Statement guides", isAnchor: false },
          { href: "/compare", label: "Compare approaches", isAnchor: false },
          { href: "/faq", label: "FAQ", isAnchor: false },
        ]
      : [
          { href: "/", label: "Home", isAnchor: false },
          { href: "/how-it-works", label: "How it works", isAnchor: false },
          { href: "/help", label: "Help Center", isAnchor: false },
          { href: "/guides", label: "Statement guides", isAnchor: false },
          { href: "/compare", label: "Compare approaches", isAnchor: false },
          { href: "/faq", label: "FAQ", isAnchor: false },
          { href: "/about", label: "About", isAnchor: false },
        ];

  return (
    <>
      <header className="topbar-wrap">
        <div className="floating-nav" role="banner">
          <Link
            href="/"
            className="brand-wordmark title-4"
            aria-label="Subscription X-Ray home"
            onClick={closeMenu}
          >
            <BrandMark size={28} />
            <span>Subscription X-Ray</span>
          </Link>

          <nav className="navlinks" aria-label="Primary navigation">
            {desktopLinks.map((item) =>
              item.isAnchor ? (
                <a key={item.href} href={item.href} className="title-4">
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`title-4${isActive(item.href) ? " is-current" : ""}`}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="nav-action">
            <Link
              className="btn btn-primary button-sm nav-cta"
              href="/scanner"
              onClick={() => {
                trackCtaClick("header_nav", "Open scanner", "/scanner");
                closeMenu();
              }}
            >
              Open scanner
            </Link>
            <button
              type="button"
              className={`mobile-nav-toggle${menuOpen ? " is-open" : ""}`}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className="menu-bars" aria-hidden="true">
                <span className="menu-bar menu-bar-top" />
                <span className="menu-bar menu-bar-bottom" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <nav
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer${menuOpen ? " is-open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <div className="mobile-nav-inner">
          <div className="mobile-nav-list">
            {mobileLinks.map((item, idx) => {
              const delayMs = Math.min(idx * 60, 360);
              const style = {
                transitionDelay: menuOpen ? `${delayMs}ms` : "0ms",
              };
              const active = !item.isAnchor && isActive(item.href);

              return item.isAnchor ? (
                <a
                  key={item.href}
                  href={item.href}
                  className="mobile-nav-link heading-5"
                  style={style}
                  tabIndex={menuOpen ? 0 : -1}
                  onClick={closeMenu}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mobile-nav-link heading-5${active ? " is-current" : ""}`}
                  aria-current={active ? "page" : undefined}
                  style={style}
                  tabIndex={menuOpen ? 0 : -1}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div
            className="mobile-nav-footer"
            style={{
              transitionDelay: menuOpen ? "380ms" : "0ms",
            }}
          >
            <Link
              className="btn btn-primary button-md full"
              href="/scanner"
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => {
                trackCtaClick(
                  "mobile_drawer",
                  "Scan my statement for ₹69",
                  "/scanner"
                );
                closeMenu();
              }}
            >
              Scan my statement for ₹69
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
