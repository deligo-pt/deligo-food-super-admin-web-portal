"use client";

import ForgotResetPassword from "@/components/FogotResetPassword/ForgotResetPassword";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forgotPasswordReq } from "@/services/forgotResetPassword/forgotResetPassword";
import { TResponse } from "@/types";
import { forgotPasswordValidation } from "@/validations/forgot-reset-password/forgot-reset-password.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Check, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

type ForgotPasswordForm = {
  email: string;
};

export default function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordValidation),
    defaultValues: {
      email: "",
    },
  });

  const watchEmail = useWatch({
    control: form.control,
    name: "email",
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    const toastId = toast.loading("Sending Recovery Email...");

    try {
      const result = (await forgotPasswordReq(data)) as TResponse<null>;
      if (result.success) {
        toast.success("Recovery Email Sent Successfully!", { id: toastId });
        setIsSubmitted(true);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Recovery Email Sending Failed",
        { id: toastId }
      );
    }
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return isSubmitted ? (
    <ForgotResetPassword
      title="Check Your Email"
      subtitle="We've sent a password reset link to your email"
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.9,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="text-center p-6"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Recovery Email Sent
        </h3>
        <p className="text-gray-500 mb-6">
          We&lsquo;ve sent a password reset link to{" "}
          <span className="font-medium text-gray-700">{watchEmail}</span>
        </p>
        <Button
          onClick={() => setIsSubmitted(false)}
          variant="outline"
          className="mt-2"
        >
          Back to Forgot Password
        </Button>
      </motion.div>
    </ForgotResetPassword>
  ) : (
    <ForgotResetPassword
      title="Forgot Password"
      subtitle="Enter your email to reset your password"
    >
      <Form {...form}>
        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <FormLabel className="flex items-center text-[#DC3173] mb-2">
                      <Mail className="w-5 h-5" />
                      <span>Email</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        className="py-3 text-base focus-visible:ring-1 focus-visible:ring-[#DC3173] focus:border-[#DC3173]! transition-all duration-300 rounded-sm"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
          <motion.div variants={itemVariants} className="mt-6">
            <Button
              className="w-full bg-[#DC3173] hover:bg-[#DC3173]/90"
              type="submit"
            >
              Send Reset Link
            </Button>
          </motion.div>
          <motion.div variants={itemVariants} className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-[#DC3173] transition-colors"
            >
              Back to Login
            </Link>
          </motion.div>
        </motion.form>
      </Form>
    </ForgotResetPassword>
  );
}
