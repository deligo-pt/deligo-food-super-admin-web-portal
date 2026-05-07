import { Mail, Bell, Send } from "lucide-react";
import { motion, Variants } from 'framer-motion';

interface IProps {
    itemVariants: Variants;
    commType: "PUSH" | "BOTH" | "EMAIL";
    setCommType: (value: "PUSH" | "BOTH" | "EMAIL") => void;
}

const OPTIONS = [
    { id: "EMAIL", label: "Email", icon: Mail },
    { id: "PUSH", label: "Push", icon: Bell },
    { id: "BOTH", label: "Both", icon: Send },
];

export default function CommunicationType({ itemVariants, commType, setCommType }: IProps) {

    return (
        <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Communication Type
            </h2>
            <div className="flex p-1 bg-gray-100 rounded-xl">
                {OPTIONS.map((type) => (
                    <button
                        key={type.id}
                        onClick={() =>
                            setCommType(type.id as "PUSH" | "BOTH" | "EMAIL")
                        }
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all relative ${commType === type.id ? "text-[#DC3173] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        {commType === type.id && (
                            <motion.div
                                layoutId="commTypeBg"
                                className="absolute inset-0 bg-white rounded-lg"
                                transition={{
                                    type: "spring",
                                    bounce: 0.2,
                                    duration: 0.6,
                                }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                        </span>
                    </button>
                ))}
            </div>
        </motion.div>
    );
}