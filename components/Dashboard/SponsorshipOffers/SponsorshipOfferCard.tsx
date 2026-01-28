"use client";

import { TSponsorshipOffer } from "@/types/sponsorship.type";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Clock, Edit2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface IProps {
  offer: TSponsorshipOffer;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SponsorshipOfferCard({
  offer,
  onEdit,
  onDelete,
}: IProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    isExpired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference =
        new Date(offer.deadline).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          isExpired: false,
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          isExpired: true,
        });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [offer.deadline]);

  const isUrgent = !timeLeft.isExpired && timeLeft.days < 3;

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.9,
      }}
      whileHover={{
        y: -4,
      }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 group relative flex flex-col h-full"
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span
          className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm
          ${timeLeft.isExpired ? "bg-gray-100 text-gray-500" : offer.isActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
        `}
        >
          {timeLeft.isExpired ? "Expired" : offer.isActive ? "Active" : "Draft"}
        </span>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-4 pr-16">
          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
            {offer.title}
          </h3>
          <div className="text-2xl font-extrabold text-brand-500">
            €{offer.price.toLocaleString()}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-6 line-clamp-2">
          {offer.description}
        </p>

        {/* Benefits */}
        <div className="space-y-2 mb-6 flex-1">
          {offer.benefits.slice(0, 4).map((benefit, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-sm text-gray-700"
            >
              <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
              <span className="line-clamp-1">{benefit}</span>
            </div>
          ))}
          {offer.benefits.length > 4 && (
            <p className="text-xs text-gray-400 pl-6">
              +{offer.benefits.length - 4} more benefits
            </p>
          )}
        </div>

        {/* Countdown Footer */}
        <div
          className={`
          mt-auto pt-4 border-t flex items-center justify-between
          ${timeLeft.isExpired ? "border-gray-100" : isUrgent ? "border-red-100" : "border-brand-100"}
        `}
        >
          <div className="flex items-center gap-2">
            {timeLeft.isExpired ? (
              <div className="flex items-center gap-1.5 text-gray-400">
                <Clock size={16} />
                <span className="text-xs font-medium">Ended</span>
              </div>
            ) : (
              <div
                className={`flex items-center gap-1.5 ${isUrgent ? "text-red-500" : "text-brand-600"}`}
              >
                {isUrgent ? <AlertTriangle size={16} /> : <Clock size={16} />}
                <span className="text-xs font-bold">
                  {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m left
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(offer._id)}
              className="p-1.5 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(offer._id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
