"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";

export default function CreatorContact() {
  return (
    <section className="contact-sec" id="contact">
      <div className="wrap">
        {/* Eyebrow Cursive Text */}
        <span className="contact-eyebrow">
          We’re here for you
        </span>

        {/* Main Heading */}
        <h2 className="contact-heading">
          Have a Question? <span className="cursive-connect">Let’s Connect</span>
        </h2>

        {/* Description */}
        <p className="contact-desc">
          Whether it’s about courses, certifications, format options, or partnerships — our team is happy to help you.
        </p>

        {/* Reach Us Button */}
        <div className="contact-btn-wrapper">
          <Link href="/reach-us" className="btn-contact-reach">
            <span className="btn-contact-circle">
              <MessageSquare className="btn-contact-icon" />
            </span>
            <span className="btn-contact-text">Reach Us</span>
            <ArrowRight className="btn-contact-arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
}
