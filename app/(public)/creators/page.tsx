"use client";

import React from "react";
import CreatorsBackground from "@/apps/public/components/landing/creators/CreatorsBackground";
import CreatorHero from "@/apps/public/components/landing/creators/CreatorHero";
import CreatorJourney from "@/apps/public/components/landing/creators/CreatorJourney";
import JourneyToWorkflowTransition from "@/apps/public/components/landing/creators/JourneyToWorkflowTransition";
import CreatorEverythingInOnePlace from "@/apps/public/components/landing/creators/CreatorEverythingInOnePlace";
import CreatorPublishingInfographic from "@/apps/public/components/landing/creators/CreatorPublishingInfographic";
import CreatorFormats from "@/apps/public/components/landing/creators/CreatorFormats";
import CreatorFAQ from "@/apps/public/components/landing/creators/CreatorFAQ";
import CreatorEnquiry from "@/apps/public/components/landing/creators/CreatorEnquiry";
import Footer from "@/apps/public/components/landing/Footer";

import "./creators.css";

export default function CreatorsPage() {
  return (
    <div className="for-creators-root relative min-h-screen overflow-x-hidden">
      <CreatorsBackground />
      <CreatorHero />
      <CreatorJourney />
      <JourneyToWorkflowTransition />
      <CreatorPublishingInfographic />
      <CreatorEverythingInOnePlace />
      <CreatorFormats />
      <CreatorEnquiry />
      <CreatorFAQ />
      <Footer />
    </div>
  );
}
