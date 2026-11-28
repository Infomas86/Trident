import React from 'react';
import { motion } from 'motion/react';

// Kartu yang masuk dengan fade + naik saat terlihat, dan terangkat saat di-hover (Motion).
// Jangan beri class transition-all/transform pada kartu ini: akan bertabrakan dengan Motion.
export default function MotionCard({ as = 'div', ...props }) {
  const Comp = motion[as];
  return (
    <Comp
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      {...props}
    />
  );
}
