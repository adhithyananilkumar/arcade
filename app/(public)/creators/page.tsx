"use client";

import React from "react";
import CreatorHero from "@/apps/public/components/landing/creators/CreatorHero";
import CreatorJourney from "@/apps/public/components/landing/creators/CreatorJourney";
import CreatorEverythingInOnePlace from "@/apps/public/components/landing/creators/CreatorEverythingInOnePlace";
import CreatorPublishing from "@/apps/public/components/landing/creators/CreatorPublishing";
import CreatorFormats from "@/apps/public/components/landing/creators/CreatorFormats";
import CreatorEducators from "@/apps/public/components/landing/creators/CreatorEducators";
import CreatorFAQ from "@/apps/public/components/landing/creators/CreatorFAQ";
import CreatorEnquiry from "@/apps/public/components/landing/creators/CreatorEnquiry";

import "./creators.css";

export default function CreatorsPage() {
  return (
    <div className="for-creators-root pt-2 lg:pt-4">
      <CreatorHero />
      <CreatorJourney />
      <CreatorEverythingInOnePlace />
      <CreatorPublishing />
      <CreatorFormats />
      <CreatorEducators />
      <CreatorEnquiry />
      <CreatorFAQ />
    </div>
  );
}
