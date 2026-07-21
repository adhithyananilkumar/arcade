"use client";

import React from "react";
import CreatorHero from "@/apps/public/components/landing/creators/CreatorHero";
import CreatorStats from "@/apps/public/components/landing/creators/CreatorStats";
import CreatorJourney from "@/apps/public/components/landing/creators/CreatorJourney";
import CreatorEverythingInOnePlace from "@/apps/public/components/landing/creators/CreatorEverythingInOnePlace";
import CreatorPublishing from "@/apps/public/components/landing/creators/CreatorPublishing";
import CreatorFormats from "@/apps/public/components/landing/creators/CreatorFormats";
import CreatorEducators from "@/apps/public/components/landing/creators/CreatorEducators";
import CreatorPuzzle from "@/apps/public/components/landing/creators/CreatorPuzzle";
import CreatorFAQ from "@/apps/public/components/landing/creators/CreatorFAQ";
import CreatorCTA from "@/apps/public/components/landing/creators/CreatorCTA";

import "./creators.css";

export default function CreatorsPage() {
  return (
    <div className="for-creators-root pt-2 lg:pt-4">
      <CreatorHero />
      <CreatorStats />
      <CreatorJourney />
      <CreatorEverythingInOnePlace />
      <CreatorPublishing />
      <CreatorFormats />
      <CreatorEducators />
      <CreatorPuzzle />
      <CreatorFAQ />
      <CreatorCTA />
    </div>
  );
}
