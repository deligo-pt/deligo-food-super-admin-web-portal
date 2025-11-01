"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, User } from "lucide-react";

type LoginForm = {
  email: string;
  password: string;
};

export default function SuperAdminLoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: LoginForm) => {
    console.log("Super Admin Login Data:", data);
    // TODO: handle login API call
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 flex items-center justify-center p-6">
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
              <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-tr from-[#DC3173] to-[#5C2BFF] rounded-full shadow-lg mb-3">
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div>
                <Label
                  htmlFor="email"
                  className="text-gray-300 flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@deligo.com"
                  className="mt-1 bg-gray-800/70 border-gray-700 text-white placeholder-gray-500 focus:ring-[#DC3173] focus:border-[#DC3173]"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <Label
                  htmlFor="password"
                  className="text-gray-300 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-gray-800/70 border-gray-700 text-white placeholder-gray-500 focus:ring-[#DC3173] focus:border-[#DC3173]"
                    {...register("password", {
                      required: "Password is required",
                    })}
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
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#DC3173] to-[#5C2BFF] hover:opacity-90 text-white font-semibold py-2 rounded-xl shadow-lg"
                >
                  Login
                </Button>
              </motion.div>
            </form>

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
