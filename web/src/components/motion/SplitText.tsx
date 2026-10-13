"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  /** segundos entre letras */
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
};

/** Texto que aparece letra por letra (palabras no se cortan al envolver). */
export function SplitText({ text, className, delay = 0, stagger = 0.035, as = "span" }: Props) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const words = text.split(" ");
  let index = 0;

  if (reduce) return <Tag className={className}>{text}</Tag>;

  return (
    <Tag
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
    >
      {words.map((word, w) => (
        <span key={w} aria-hidden className="inline-block whitespace-nowrap">
          {word.split("").map((char) => {
            const i = index++;
            return (
              <motion.span
                key={i}
                className="inline-block"
                variants={{
                  hidden: { opacity: 0, y: "0.6em", filter: "blur(8px)" },
                  show: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.7, delay: delay + i * stagger, ease: [0.2, 0.7, 0.2, 1] },
                  },
                }}
              >
                {char}
              </motion.span>
            );
          })}
          {w < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}
