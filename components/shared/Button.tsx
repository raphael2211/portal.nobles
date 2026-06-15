'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: ButtonProps) {
  const base = 'px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <motion.div
      as="button"
      whileTap={{ scale: 0.98 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}