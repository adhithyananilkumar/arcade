"use client";

import Link from "next/link";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="arc-footer">
      {/* Subtle blueprint grid background overlay */}
      <div className="arc-footer__grid-overlay"></div>

      <div className="arc-footer__container">

        {/* Main Content Area */}
        <div className="arc-footer__content">

          {/* Left Column: Brand & Newsletter */}
          <div className="arc-footer__newsletter-section">
            <div className="arc-footer__logo-row">
              <span className="arc-footer__logo-text">arcade<span>.</span></span>
            </div>
            <h3 className="arc-footer__headline">Stay connected with AJCE catalog updates.</h3>

            <form className="arc-footer__form" onSubmit={(e) => e.preventDefault()}>
              <div className="arc-footer__input-wrapper">
                <input
                  type="email"
                  placeholder="Enter your college email address"
                  className="arc-footer__input"
                  required
                />
                <button type="submit" className="arc-footer__submit-btn" aria-label="Subscribe">
                  Subscribe
                </button>
              </div>
            </form>

            <p className="arc-footer__subtext">
              By subscribing, you agree to receive curriculum catalog notifications and campus event schedules.
            </p>
          </div>

          {/* Right Column: Clean Grid of Links */}
          <div className="arc-footer__links-grid">

            {/* Col 1 */}
            <div className="arc-footer__links-col">
              <span className="arc-footer__col-title">Departments</span>
              <ul className="arc-footer__list">
                <li><Link href="/courses?category=Computer+Science">Computer Science</Link></li>
                <li><Link href="/courses?category=Information+Technology">Information Tech</Link></li>
                <li><Link href="/courses?category=Business+%26+Management">Business Management</Link></li>
              </ul>
            </div>

            {/* Col 2 */}
            <div className="arc-footer__links-col">
              <span className="arc-footer__col-title">Platform</span>
              <ul className="arc-footer__list">
                <li><Link href="/explore">Explore</Link></li>
                <li><Link href="/forum">Forum</Link></li>
                <li><Link href="/content-creator">Reach us</Link></li>
                <li><Link href="/docs">Developer API</Link></li>
                <li><Link href="/status">Network Status</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="arc-footer__links-col">
              <span className="arc-footer__col-title">Campus Resources</span>
              <ul className="arc-footer__list">
                <li><a href="https://www.amaljyothi.ac.in" target="_blank" rel="noopener noreferrer">AJCE Portal</a></li>
                <li><Link href="/placement">Placements</Link></li>
                <li><Link href="/library">Digital Library</Link></li>
                <li><Link href="/calendar">Academic Calendar</Link></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Row */}
        <div className="arc-footer__bottom">
          <div className="arc-footer__bottom-left">
            <span>© 2026 Arcade Catalog. AJCE Campus. All rights reserved.</span>
          </div>

          <div className="arc-footer__bottom-right">
            <Link href="/privacy">Privacy Policy</Link>
            <span className="arc-footer__dot"></span>
            <Link href="/terms">Terms of Service</Link>
            <span className="arc-footer__dot"></span>
            <span>Node: Kerala, IN</span>
          </div>
        </div>

      </div>

      {/* Giant "arcade" brand watermark at the bottom center (Laravel Style) */}
      <div className="arc-footer__watermark">arcade.</div>
    </footer>
  );
}

