import { motion } from 'motion/react';

export default function BackgroundEffect() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#0A0B0F] pointer-events-none">
      {/* Mesh background effect with radial indicators */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #6C63FF 1px, transparent 1px),
            linear-gradient(to bottom, #6C63FF 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating Glowing Sphere 1 */}
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 50, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-primary opacity-[0.13] blur-[120px]"
      />

      {/* Floating Glowing Sphere 2 */}
      <motion.div
        animate={{
          x: [0, -100, 50, 0],
          y: [0, 90, -40, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-40 -right-40 w-[450px] h-[450px] rounded-full bg-[#00D4FF] opacity-[0.11] blur-[130px]"
      />

      {/* Floating Glowing Sphere 3 */}
      <motion.div
        animate={{
          x: [0, 40, -50, 0],
          y: [0, 80, -60, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 rounded-full bg-[#6C63FF] opacity-[0.05] blur-[100px]"
      />
    </div>
  );
}
