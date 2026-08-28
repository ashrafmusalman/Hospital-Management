import { motion } from "framer-motion";

const easeOut = [0.4, 0, 0.2, 1];

// Fades + slides a section into place once it scrolls into view.
export function Reveal({ children, delay = 0, y = 24, className, style }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  );
}

// Wrap a grid/list container with StaggerGroup, and each child with StaggerItem —
// children reveal one after another as the group scrolls into view.
export function StaggerGroup({ children, className, style, stagger = 0.06 }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, y = 22, className }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } } }}
    >
      {children}
    </motion.div>
  );
}
