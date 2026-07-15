import Link from "next/link";
import "./Footer.css";

export default function Footer() {
  return (
    <div className="arc-footer-wrapper">
      <footer className="arc-footer">
        {/* Glow meshes for organic light */}
        <div className="arc-footer__glow arc-footer__glow--purple" />
        <div className="arc-footer__glow arc-footer__glow--cyan" />

        <div className="arc-footer__top">
          <div className="arc-footer__brand-col">
            <div className="arc-footer__brand-row">
              <div className="arc-footer__logo-mark">
                <div className="arc-footer__logo-inner" />
              </div>
              <div className="arc-footer__brand-meta">
                <span className="arc-footer__brand-name">Arcade</span>
                <span className="arc-footer__brand-tag">AJCE platform</span>
              </div>
            </div>
            <h3 className="arc-footer__h3">
              One login.
              <span className="arc-footer__accent">Six ways forward.</span>
            </h3>
            <p className="arc-footer__desc">
              Arcade brings study tools, campus connections, and progress tracking into one place for every AJCE student.
            </p>
            <div className="arc-footer__cta-wrap">
              <Link className="arc-footer__cta" href="/register">
                Get started
                <svg
                  className="arc-footer__cta-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12L10 8L6 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <div className="arc-footer__links-grid">
            <div className="arc-footer__col">
              <div className="arc-footer__col-title">Menu</div>
              <Link href="/">Home</Link>
              <Link href="/features">Features</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/docs">Docs</Link>
            </div>

            <div className="arc-footer__col">
              <div className="arc-footer__col-title">Company</div>
              <Link href="/about">About</Link>
              <Link href="/team">Team</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/careers">Careers</Link>
            </div>

            <div className="arc-footer__col">
              <div className="arc-footer__col-title">Pillars</div>
              <Link href="/study">Study</Link>
              <Link href="/connect">Connect</Link>
              <Link href="/track">Track</Link>
              <Link href="/achieve">Achieve</Link>
              <Link href="/launch">Launch</Link>
              <Link href="/grow">Grow</Link>
            </div>
          </div>
        </div>

        <div className="arc-footer__bottom">
          <div className="arc-footer__legal">
            © 2026 Arcade — AJCE. All rights reserved.
          </div>
          <div className="arc-footer__watermark">arcade.</div>
        </div>
      </footer>
    </div>
  );
}
