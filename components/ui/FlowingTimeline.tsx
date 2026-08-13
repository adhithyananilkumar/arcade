"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const TIMELINE_DATA = [
  {
    num: "01",
    title: "It Began With a Question",
    subtitle: "What can a department give back to the world?",
    desc: "And somewhere between curiosity and possibility, the first page of Arcade began to unfold."
  },
  {
    num: "02",
    title: "An Idea Found Its Name",
    subtitle: "March 10",
    desc: "Adhithyan envisioned a content marketplace where students could learn through classes offered as part of the Silver Jubilee, helping them build new skills and discover new possibilities. He named it Arcade and shared the vision with Lisha Varghese, Faculty In-Charge and guide of the platform. A simple idea had found its name—and the wheels began to turn."
  },
  {
    num: "03",
    title: "We Looked Before We Built",
    subtitle: "March 12",
    desc: "The team began by looking at what already existed, studying existing systems, their strengths, their shortcomings, and their relevance. From these observations, a basic case study took shape, giving the idea its first sense of direction."
  },
  {
    num: "04",
    title: "The Blueprint Took Shape",
    subtitle: "March 14",
    desc: "As more information gathered, so did the team. Ideas that once lived only in conversations slowly found their place on paper, and the first basic architecture of Arcade began to emerge. The vision was no longer just imagined—it could now be seen."
  },
  {
    num: "05",
    title: "Ideas Met Experience",
    subtitle: "March 16",
    desc: "We carried the vision beyond our own walls, sharing it with Mercedes Benz and YAG for industrial guidance. Their insights challenged us to look again, rethink what we had designed, and refine the architecture into something stronger."
  },
  {
    num: "06",
    title: "A Door Opened",
    subtitle: "March 17",
    desc: "With the architecture and setup plan ready, we approached the college administration seeking support. Their encouragement came with the infrastructure we needed, giving Arcade not just an idea to follow, but a place in which that idea could grow."
  },
  {
    num: "07",
    title: "The Idea Came Alive",
    subtitle: "April 3",
    desc: "Development began with design, slowly moving into UI while the backend took shape alongside it. Screen by screen and step by step, what once lived in sketches and discussions began becoming something real. Arcade was learning how to take its first breath."
  },
  {
    num: "08",
    title: "Another Voice Joined",
    subtitle: "July 20",
    desc: "As the UI team expanded, Anna Christina Johny joined the journey. With another mind, another perspective, and another pair of hands, the story grew a little richer—and the road ahead a little wider."
  },
  {
    num: "09",
    title: "The First Chapter Became Real",
    subtitle: "July 25",
    desc: "Phase 1 reached its first milestone with the completion of the MVP, reviewed by Merin Chacko, Amal K Jose, and Binumon Joseph, our Faculty In-Charges. The sketches had become screens, the conversations had become creation, and Arcade had finally become something we could hold in our hands."
  },
  {
    num: "10",
    title: "And Then, We Grew",
    subtitle: "The Next Chapter",
    desc: "As Arcade grew, so did the work—and the team grew with it. New members joined to share the workload, bringing fresh hands, ideas, and energy into the journey. What began with a few minds was slowly becoming something built by many."
  },
  {
    num: "11",
    title: "The Story Isn't Over",
    subtitle: "",
    desc: "A question became an idea. An idea became a team. A team became a platform. And now, the line continues forward—because Arcade was never meant to be a finished story. The next chapter is still waiting to be written."
  }
];

export default function FlowingTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end 80%"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="w-full max-w-5xl mx-auto py-24 px-4 sm:px-6">
      
      <div className="text-center mb-16 md:mb-24 relative z-10">
        <h2 
          className="text-5xl sm:text-6xl lg:text-7xl text-slate-900 tracking-normal"
          style={{ fontFamily: "'Dancing Script', 'Satisfy', 'Caveat', 'Great Vibes', cursive", fontWeight: 700 }}
        >
          Arcade — A Story Still Unfolding
        </h2>
      </div>

      <div className="relative" ref={containerRef}>
        {/* Center Line Container (Desktop) / Left Line Container (Mobile) */}
        <div className="absolute left-[30px] md:left-1/2 top-4 bottom-4 w-[2px] bg-slate-200/50 -translate-x-1/2 overflow-hidden rounded-full">
          {/* Animated Glowing Line */}
          <motion.div 
            className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-400 via-indigo-500 to-teal-400"
            style={{ height: lineHeight }}
          />
        </div>

      <div className="space-y-16 md:space-y-24 relative z-10">
        {TIMELINE_DATA.map((item, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <motion.div 
              key={item.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`flex flex-col md:flex-row items-start md:items-center w-full ${isEven ? "md:flex-row-reverse" : ""}`}
            >
              
              {/* Empty space for alternating layout on desktop */}
              <div className="hidden md:block md:w-[45%]" />

              {/* Numbered Node */}
              <div className="md:w-[10%] flex justify-center shrink-0 mb-6 md:mb-0 ml-1 md:ml-0 relative z-20">
                <motion.div 
                  initial={{ scale: 0.8, backgroundColor: "#f8fafc" }}
                  whileInView={{ scale: 1.1, backgroundColor: "#ffffff" }}
                  viewport={{ once: false, margin: "-200px" }}
                  transition={{ duration: 0.4 }}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-slate-100 bg-white shadow-xl shadow-blue-500/10 flex items-center justify-center relative group"
                >
                  <span className="text-lg md:text-xl font-bold text-slate-800 font-sans tracking-tighter">
                    {item.num}
                  </span>
                  
                  {/* Subtle pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-indigo-400/30"
                    initial={{ scale: 1, opacity: 0 }}
                    whileInView={{ scale: 1.4, opacity: 0 }}
                    viewport={{ once: false, margin: "-200px" }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "loop" }}
                  />
                </motion.div>
              </div>

              {/* Content Box */}
              <div className={`md:w-[45%] pl-16 md:pl-0 ${isEven ? "md:pr-12 md:text-left" : "md:pl-12 md:text-left"}`}>
                <div className="py-2">
                  <h3 
                    className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-wide"
                    style={{ fontFamily: "'Dancing Script', 'Satisfy', 'Caveat', 'Great Vibes', cursive" }}
                  >
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <div className="text-indigo-500 font-semibold text-sm mb-3">
                      {item.subtitle}
                    </div>
                  )}
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
