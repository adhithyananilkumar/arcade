'use client';

import { motion } from 'framer-motion';
import { RubiksCube3D } from './RubiksCube3D';

export function RubiksCubeSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex items-center justify-center py-4"
    >
      <RubiksCube3D />
    </motion.section>
  );
}


