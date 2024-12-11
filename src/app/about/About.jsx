"use client";

import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto text-center px-6 py-12"
      >
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-extrabold mb-6"
        >
          About Eventify
        </motion.h1>

        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl mb-6"
        >
          Eventify is your one-stop solution for managing and organizing events. Whether you're planning a concert, conference, or party, we provide you with all the tools you need to make your event a success.
        </motion.p>

        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg md:text-xl"
        >
          Our mission is to bring people together through unforgettable experiences. With an easy-to-use interface, powerful features, and seamless integration, Eventify makes event management effortless.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default About;
