"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import BrandMark from "@/components/BrandMark";

export default function SiteHeader({
  mode = "content",
}: {
  mode?: "home" | "content";
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="topbar-wrap">
      <div className="wrap navrow">
        <Link
          href="/"
          className="brand-wordmark"
          aria-label="Subscription X-Ray home"
          onClick={closeMenu}
        >
          <BrandMark size={32} />
          <span>Subscription X-Ray</span>
        </Link>

        <nav className="navlinks" aria-label="Primary navigation">
          {mode === "home" ? (
            <>
              <a href="#how">How it works</a>
              <a href="#demo">Sample scan</a>
              <a href="#pricing">Pricing</a>
              <Link href="/guides">Guides</Link>
              <Link href="/about">About</Link>
            </>
          ) : (
            <>
              <Link href="/">Home</Link>
              <Link href="/guides">Guides</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/#pricing">Pricing</Link>
            </>
          )}
        </nav>

        <div className="nav-action">
          <Link
            className="btn btn-primary btn-sm"
            href="/scanner"
            onClick={closeMenu}
          >
            Open scanner
          </Link>
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav-drawer"
          className="mobile-nav-drawer"
          aria-label="Mobile navigation"
        >
          <div className="wrap mobile-nav-list">
            {mode === "home" ? (
              <>
                <a href="#how" onClick={closeMenu}>
                  How it works
                </a>
                <a href="#demo" onClick={closeMenu}>
                  Sample scan
                </a>
                <a href="#pricing" onClick={closeMenu}>
                  Pricing
                </a>
                <Link href="/guides" onClick={closeMenu}>
                  Statement guides
                </Link>
                <Link href="/about" onClick={closeMenu}>
                  About
                </Link>
                <Link href="/contact" onClick={closeMenu}>
                  Contact
                </Link>
              </>
            ) : (
              <>
                <Link href="/" onClick={closeMenu}>
                  Home
                </Link>
                <Link href="/guides" onClick={closeMenu}>
                  Statement guides
                </Link>
                <Link href="/about" onClick={closeMenu}>
                  About
                </Link>
                <Link href="/contact" onClick={closeMenu}>
                  Contact
                </Link>
                <Link href="/#pricing" onClick={closeMenu}>
                  Pricing
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
