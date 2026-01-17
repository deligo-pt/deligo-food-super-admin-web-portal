"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { loginReq } from "@/services/auth/login";
import { setCookie } from "@/utils/cookies";
import { getAndSaveFcmToken } from "@/utils/fcmToken";
import { loginValidation } from "@/validations/auth/auth.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type LoginForm = {
  email: string;
  password: string;
};

export default function SuperAdminLoginPage({
  redirect,
}: {
  redirect?: string;
}) {
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    const toastId = toast.loading("Logging in...");

    const result = await loginReq(data);

    if (result?.success) {
      const decoded = jwtDecode(result.data.accessToken) as { role: string };

      if (decoded.role === "SUPER_ADMIN" || decoded.role === "ADMIN") {
        setCookie("accessToken", result.data.accessToken, 7);
        setCookie("refreshToken", result.data.refreshToken, 365);
        toast.success("Login successful!", { id: toastId });

        // get and save fcm token
        setTimeout(() => {
          getAndSaveFcmToken(result.data.accessToken);
        }, 1000);

        if (redirect) {
          router.push(redirect);
          return;
        }

        router.push("/admin/dashboard");
        return;
      }

      toast.error("You are not a super admin", { id: toastId });
      return;
    }

    toast.error(result.message, { id: toastId });
    console.log(result);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-xl bg-gray-900/60 border border-gray-700 shadow-2xl rounded-2xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-linear-to-tr from-[#DC3173] to-[#5C2BFF] rounded-full shadow-lg mb-3">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Super Admin Login
              </CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                Sign in to manage the DeliGo system
              </p>
            </motion.div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 flex items-center gap-2">
                        <User className="w-4 h-4" /> Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@deligo.com"
                          className="mt-1 bg-gray-800/70 border-gray-700 text-white placeholder-gray-500 focus:ring-[#DC3173] focus:border-[#DC3173]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative mt-1">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={cn(
                              "bg-gray-800/70 text-white placeholder-gray-500 focus:ring-[#DC3173] focus:border-[#DC3173]",
                              fieldState.invalid
                                ? "border-destructive"
                                : "border-gray-700",
                            )}
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-[#DC3173] transition"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-linear-to-r from-[#DC3173] to-[#5C2BFF] hover:opacity-90 text-white font-semibold py-2 rounded-xl shadow-lg"
                  >
                    Login
                  </Button>
                </motion.div>
              </form>
            </Form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center text-gray-400 text-sm mt-6"
            >
              © {new Date().getFullYear()} DeliGo — All Rights Reserved
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
