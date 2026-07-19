"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./LogoStrip.css";

interface LogoItem {
  name?: string;
  customHtml?: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}

const SLOTS: LogoItem[][] = [
  [
    { name: "AJCE", color: "#1D3557" },
    { name: "IEEE", color: "#00629B" },
    { name: "NPTEL", color: "#E76F51" }
  ],
  [
    {
      customHtml: (
        <>
          <span style={{ color: "#4285F4" }}>G</span>
          <span style={{ color: "#EA4335" }}>o</span>
          <span style={{ color: "#FBBC05" }}>o</span>
          <span style={{ color: "#4285F4" }}>g</span>
          <span style={{ color: "#34A853" }}>l</span>
          <span style={{ color: "#EA4335" }}>e</span>
        </>
      )
    },
    { name: "Coursera", color: "#0056D2" },
    { name: "edX", color: "#02262B" }
  ],
  [
    { name: "aws", color: "#FF9900", style: { letterSpacing: "0.5px" } },
    { name: "Azure", color: "#0078D4" },
    { name: "IBM Cloud", color: "#0F62FE" }
  ],
  [
    {
      customHtml: (
        <>
          <span className="sq">
            <span style={{ background: "#F25022" }}></span>
            <span style={{ background: "#7FBA00" }}></span>
            <span style={{ background: "#00A4EF" }}></span>
            <span style={{ background: "#FFB900" }}></span>
          </span>
          <span>Microsoft</span>
        </>
      ),
      color: "#5E5E5E"
    },
    { name: "GitHub", color: "#181717" },
    { name: "LinkedIn", color: "#0A66C2" }
  ],
  [
    { name: "IBM", color: "#052FAD", style: { letterSpacing: "1px" } },
    { name: "Cisco", color: "#1BA0D7" },
    { name: "Intel", color: "#0071C5" }
  ],
  [
    { name: "ORACLE", color: "#C74634" },
    { name: "SAP", color: "#0FAAFF" },
    { name: "Salesforce", color: "#00A1E0" }
  ]
];

function LogoSlot({ items, index }: { items: LogoItem[]; index: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Stagger the very first cycle start per slot too
    const firstDelay = 1200 + index * 500 + Math.random() * 800;
    let timer: NodeJS.Timeout;

    const cycle = () => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
      const nextDelay = 2200 + Math.random() * 1800; // stagger so slots don't sync
      timer = setTimeout(cycle, nextDelay);
    };

    const firstTimer = setTimeout(cycle, firstDelay);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(timer);
    };
  }, [items.length, index]);

  const activeItem = items[currentIndex];

  return (
    <div className="logo-slot">
      <AnimatePresence>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: "easeInOut" as const }}
          className="logo-item"
          style={{
            color: activeItem.color,
            ...activeItem.style,
          }}
        >
          {activeItem.customHtml ? activeItem.customHtml : <span>{activeItem.name}</span>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function LogoStrip() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 0.6,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  const slotContainerVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <motion.section
      className="trusted-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <motion.p className="trusted-heading" variants={headingVariants}>
        Trusted by educators and organizations worldwide
      </motion.p>
      <div className="logo-row">
        {SLOTS.map((items, i) => (
          <motion.div
            key={i}
            className="logo-slot-wrapper"
            style={{ width: "100%" }}
            variants={slotContainerVariants}
          >
            <LogoSlot items={items} index={i} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
