"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CreatorFAQ() {
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({
    0: true, // open the first FAQ by default
  });

  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const faqItems = [
    {
      q: "How does the quality review process work?",
      a: "Every course, workshop, or webinar goes through a brief structural check by our quality assurance team. We verify that video files stream correctly, assessments are validly formatted, and the syllabus matches the title before it goes live in the public catalog.",
    },
    {
      q: "Are there any fees for paid courses?",
      a: "Arcade charges a 0% platform fee on course transactions. You only cover standard Stripe credit card processing fees, leaving the remainder of your earnings directly in your account.",
    },
    {
      q: "Can multiple authors edit the same course?",
      a: "Yes! If you publish as an organization, you can add co-authors by entering their emails. They get full editing privileges on the course draft, and their profile is listed as co-creator on the published syllabus.",
    },
    {
      q: "Can I self-host coding playgrounds?",
      a: "Absolutely. Arcade integrates custom visual terminals. You configure the container specifications, define setup scripts, and students run safe terminal processes directly inside the web browser during lessons.",
    },
  ];

  return (
    <section className="faq-sec" id="faq">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Got questions?</span>
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="faq-list">
          {faqItems.map((item, idx) => {
            const isOpen = !!openFaqs[idx];
            return (
              <div key={idx} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className="faq-q"
                  onClick={() => toggleFaq(idx)}
                >
                  <span>{item.q}</span>
                  <span className="chev">
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </button>
                {isOpen && (
                  <div className="faq-a">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
