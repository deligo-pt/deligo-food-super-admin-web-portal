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
import { resetPasswordReq } from "@/services/forgotResetPassword/forgotResetPassword";
import { TResponse } from "@/types";
import { resetPasswordValidation } from "@/validations/forgot-reset-password/forgot-reset-password.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircleIcon, Eye, EyeOff, LockIcon, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type ResetPasswordForm = z.infer<typeof resetPasswordValidation>;

const ResetPasswordForm = ({ token }: { token: string }) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordValidation),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    const toastId = toast.loading("Resetting Password...");

    const resetData = {
      email: data.email,
      newPassword: data.password,
      token,
    };
    try {
      const result = (await resetPasswordReq(resetData)) as TResponse<null>;
      if (result.success) {
        toast.success("Password Reset Successfully!", { id: toastId });
        setIsSubmitted(true);
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Password Reset Failed", {
        id: toastId,
      });
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
      title="Password Reset Complete"
      subtitle="Your password has been successfully reset"
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
          <CheckCircleIcon className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Password Updated
        </h3>
        <p className="text-gray-500 mb-6">
          Your password has been successfully reset. You can now use your new
          password to log in.
        </p>
        <Button className="mt-2">Continue to Login</Button>
      </motion.div>
    </ForgotResetPassword>
  ) : (
    <ForgotResetPassword
      title="Reset Password"
      subtitle="Create a new password for your account"
    >
      <Form {...form}>
        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
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
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div>
                    <FormLabel className="flex items-center text-[#DC3173] mb-2">
                      <LockIcon className="w-5 h-5" />
                      <span>New Password</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter a new password"
                          className="py-3 text-base focus-visible:ring-1 focus-visible:ring-[#DC3173] focus:border-[#DC3173]! transition-all duration-300 rounded-sm"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-[#DC3173] transition"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <div>
                    <FormLabel className="flex items-center text-[#DC3173] mb-2">
                      <LockIcon className="w-5 h-5" />
                      <span>ConfirmPassword</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          className="py-3 text-base focus-visible:ring-1 focus-visible:ring-[#DC3173] focus:border-[#DC3173]! transition-all duration-300 rounded-sm"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-[#DC3173] transition"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
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
              Reset Password
            </Button>
          </motion.div>
          <motion.div variants={itemVariants} className="mt-6 text-center">
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-[#DC3173] transition-colors"
            >
              Back to Login
            </a>
          </motion.div>
        </motion.form>
      </Form>
    </ForgotResetPassword>
  );
};
export default ResetPasswordForm;
