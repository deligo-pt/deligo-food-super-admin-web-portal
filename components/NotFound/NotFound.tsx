"use client";

import { motion } from "framer-motion";
import {
  Bike,
  Coffee,
  Cookie,
  Home,
  IceCream,
  Pizza,
  UtensilsCrossed,
} from "lucide-react";
import { useRouter } from "next/navigation";
export function NotFound() {
  const router = useRouter();
  const floatingIcons = [
    {
      Icon: Pizza,
      x: "10%",
      y: "20%",
      delay: 0,
      size: 48,
      rotate: 15,
    },
    {
      Icon: Coffee,
      x: "85%",
      y: "15%",
      delay: 1.5,
      size: 40,
      rotate: -10,
    },
    {
      Icon: IceCream,
      x: "15%",
      y: "75%",
      delay: 0.5,
      size: 52,
      rotate: -20,
    },
    {
      Icon: Cookie,
      x: "80%",
      y: "65%",
      delay: 2,
      size: 44,
      rotate: 25,
    },
    {
      Icon: UtensilsCrossed,
      x: "50%",
      y: "10%",
      delay: 1,
      size: 36,
      rotate: 45,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-[#DC3173]/10 to-white overflow-hidden relative flex flex-col items-center justify-center p-4">
      {/* Background Decorative Blobs */}
      {/* Soft Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] left-[10%] w-[40%] h-[40%] bg-[#DC3173]/20 blur-3xl rounded-full" />
        <div className="absolute bottom-[0%] right-[10%] w-[50%] h-[50%] bg-[#DC3173]/15 blur-3xl rounded-full" />
      </div>

      {/* Floating Food Icons Layer */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-[#DC3173]/60 pointer-events-none"
          style={{
            left: item.x,
            top: item.y,
          }}
          initial={{
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -20, 0],
            rotate: [
              item.rotate,
              item.rotate + 10,
              item.rotate - 10,
              item.rotate,
            ],
          }}
          transition={{
            opacity: {
              duration: 0.5,
              delay: item.delay,
            },
            scale: {
              duration: 0.5,
              delay: item.delay,
            },
            y: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.delay,
            },
            rotate: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.delay,
            },
          }}
        >
          <item.Icon size={item.size} />
        </motion.div>
      ))}

      {/* Main Content Container */}
      <div className="relative z-10 max-w-3xl w-full text-center">
        {/* Animated 404 Display */}
        <motion.div
          className="relative mb-8 inline-block"
          initial={{
            y: -50,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
        >
          <h1 className="text-[150px] md:text-[220px] font-black leading-none text-transparent bg-clip-text bg-linear-to-br from-[#DC3173] to-[#D60059] select-none drop-shadow-sm">
            404
          </h1>

          {/* Scooter Animation driving across the 404 */}
          <motion.div
            className="absolute bottom-4 right-0"
            initial={{
              x: "0%",
              opacity: 0,
            }}
            animate={{
              x: "-550%",
              opacity: 1,
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 1,
            }}
          >
            <Bike size={64} className="transform -scale-x-100" />
            <motion.div
              className="absolute -right-4 top-1/2 w-8 h-4 bg-gray-200/50 blur-sm rounded-full"
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
              }}
            />
          </motion.div>
        </motion.div>

        {/* Text Content */}
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
            delay: 0.4,
            duration: 0.6,
          }}
          className="space-y-6"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
            Page Not Found
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
            Oops! It looks like you&lsquo;ve stumbled upon a dead end 🗺️. The
            page you&lsquo;re searching for seems to have been misplaced or
            moved to a different location.
          </p>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.8,
            }}
          >
            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="group relative px-8 py-4 bg-[#DC3173] text-white rounded-full font-bold text-lg shadow-lg shadow-[#DC317330] overflow-hidden flex items-center gap-2"
              onClick={() => router.push("/")}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Home size={20} />
                Back to Home
              </span>
              <motion.div
                className="absolute inset-0 bg-[#DC3173] rounded-full"
                initial={{
                  x: "-100%",
                }}
                whileHover={{
                  x: 0,
                }}
                transition={{
                  type: "tween",
                  ease: "easeInOut",
                }}
              />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-linear-to-r from-[#DC3173] via-[#ff5fa0] to-[#DC3173] opacity-60" />
    </div>
  );
}
