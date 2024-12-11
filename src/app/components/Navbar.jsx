"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 shadow-lg z-50"
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-6 md:px-12">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-white text-3xl font-extrabold tracking-wide"
        >
          Eventify
        </motion.div>

        {/* Navigation Menu */}
        <motion.ul
          className="hidden md:flex items-center space-x-8 text-white text-lg"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          {["Home", "About", "Contact"].map((item, index) => (
            <motion.li
              key={index}
              whileHover={{ scale: 1.1, color: "#fff" }}
              whileTap={{ scale: 0.9 }}
            >
              <Link href={item === "Home" ? "/" : `/${item.toLowerCase()}`}>
                <span className="hover:text-yellow-300 transition-all duration-300 ease-in-out">{item}</span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>

        {/* Hamburger Menu for Mobile */}
        <motion.div
          className="md:hidden cursor-pointer"
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </motion.div>

        {/* Sign In Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-yellow-400 text-gray-800 px-6 py-3 rounded-full shadow-lg hover:bg-yellow-500 transition-all duration-300 ease-in-out"
        >
          Sign In
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
