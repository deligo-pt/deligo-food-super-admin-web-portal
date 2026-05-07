import { motion, Variants } from 'framer-motion';

interface IProps {
    title: string;
    setTitle: (value: string) => void;
    body: string;
    setBody: (value: string) => void;
    itemVariants: Variants;
}

export default function MessageForm({
    title,
    setTitle,
    body,
    setBody,
    itemVariants
}: IProps) {
    return (
        <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Message Content
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Message Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Short, catchy title ..."
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#DC3173] focus:ring-1 focus:ring-[#DC3173] outline-none transition-all"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-end mb-1.5">
                        <label className="block text-xs font-semibold text-gray-600">
                            Message Body
                        </label>
                        <span className="text-xs text-gray-400">
                            {body.length} chars
                        </span>
                    </div>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write your message here..."
                        rows={6}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#DC3173] focus:ring-1 focus:ring-[#DC3173] outline-none transition-all resize-none"
                    />
                </div>
            </div>
        </motion.div>
    );
}