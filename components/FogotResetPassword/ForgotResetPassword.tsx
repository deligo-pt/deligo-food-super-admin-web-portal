"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
interface IProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function ForgotResetPassword({
  children,
  title,
  subtitle,
}: IProps) {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{
                scale: 0.9,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                delay: 0.2,
              }}
              className="mb-6"
            >
              <div className="w-10 h-10 bg-[#DC3173] rounded-full flex items-center justify-center mx-auto overflow-hidden">
                <Image
                  className="w-full"
                  src="/deligoLogo.png"
                  width={20}
                  height={20}
                  alt="Deligo"
                />
              </div>
              <h4 className="text-[#DC3173] font-semibold mt-1">DeliGo</h4>
            </motion.div>
            <motion.h2
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.3,
              }}
              className="text-2xl font-bold text-gray-800"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.4,
              }}
              className="text-gray-500 mt-2"
            >
              {subtitle}
            </motion.p>
          </div>
          {children}
        </div>
        <div className="bg-gray-50 p-4 text-center text-sm text-gray-500">
          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.6,
            }}
          >
            Need help?{" "}
            <Link
              href="/support"
              className="text-[#DC3173] font-medium hover:underline"
            >
              Contact Support
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
