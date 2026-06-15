'use client';

import React from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
  const base = 'px-4 py-2 rounded font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:scale-95 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95 focus:ring-red-500',
  };

  const { onAnimationStart, onAnimationEnd, onAnimationIteration, ...safeRest } = rest as any;

  return (
    <motion.button 
      whileTap={{ scale: 0.98 }} 
      className={`${base} ${variants[variant]} ${className}`} 
      {...safeRest}
    >
      {children}
    </motion.button>
  );
}