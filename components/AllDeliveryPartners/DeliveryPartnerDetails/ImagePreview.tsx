import { motion } from "framer-motion";
import Image from "next/image";

export default function ImagePreview({
  url,
  alt,
}: {
  url: string;
  alt: string;
}) {
  return (
    <div className="relative">
      {url?.toLowerCase()?.endsWith(".pdf") ? (
        <iframe
          src={url || ""}
          className="w-full h-48 rounded-lg  border border-gray-200"
          allow="fullscreen"
        />
      ) : (
        <Image
          src={url}
          alt={alt}
          className="w-full h-48 object-cover rounded-lg"
          width={500}
          height={500}
        />
      )}
      <div className="absolute bottom-2 left-2">
        <motion.button
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
          className="text-xs bg-white/80 backdrop-blur-sm text-[#DC3173] px-3 py-1 rounded-full"
        >
          View Full Image
        </motion.button>
      </div>
    </div>
  );
}
