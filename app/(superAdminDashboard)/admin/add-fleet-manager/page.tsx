
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Mail, CheckCircle, User, Building2, Banknote, FileText, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const DELIGO = '#DC3173';

export default function AddFleetManagerPage() {
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  function sendOtp() {
    setOtpSent(true);
    setTimeout(() => setEmailVerified(true), 1400); 
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-extrabold mb-6 flex items-center gap-3">
        <User className="w-8 h-8" style={{ color: DELIGO }} /> Add Fleet Manager
      </motion.h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">

          {/* Personal Information */}
          <Card className="p-6 border-t-4 shadow-md" style={{ borderColor: DELIGO }}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><User className="w-5 h-5" /> 1. Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input placeholder="First Name" />
              </div>

              <div>
                <Label>Last Name</Label>
                <Input placeholder="Last Name" />
              </div>

              <div className="md:col-span-2">
                <Label>Email</Label>
                <div className="flex items-center gap-3">
                  <Input placeholder="Email" />
                  {!otpSent && !emailVerified && (
                    <Button style={{ background: DELIGO }} onClick={sendOtp}><Mail className="w-4 h-4 mr-2" /> Send OTP</Button>
                  )}
                  {otpSent && !emailVerified && (
                    <Input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-32" />
                  )}
                  {emailVerified && (
                    <span className="text-green-600 flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4" /> Verified</span>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <Label>Phone Number</Label>
                <Input placeholder="Phone Number" />
              </div>
            </div>
          </Card>

          {/* Company Details */}
          <Card className="p-6 border-t-4 shadow-md" style={{ borderColor: DELIGO }}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Building2 className="w-5 h-5" /> 2. Company Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Company Name</Label>
                <Input placeholder="Company Name" />
              </div>

              <div>
                <Label>Business License Number</Label>
                <Input placeholder="License Number" />
              </div>

              <div>
                <Label>City</Label>
                <Input placeholder="City" />
              </div>

              <div>
                <Label>Postal Code</Label>
                <Input placeholder="Postal Code" />
              </div>

              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input placeholder="Full Address" />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">

          {/* Bank Details */}
          <Card className="p-6 border-t-4 shadow-md" style={{ borderColor: DELIGO }}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Banknote className="w-5 h-5" /> 3. Bank & Payment</h2>
            <div className="space-y-4">
              <div>
                <Label>Bank Name</Label>
                <Input placeholder="Bank Name" />
              </div>

              <div>
                <Label>Account Holder Name</Label>
                <Input placeholder="Account Holder" />
              </div>

              <div>
                <Label>IBAN</Label>
                <Input placeholder="IBAN" />
              </div>

              <div>
                <Label>Swift Code</Label>
                <Input placeholder="Swift Code" />
              </div>
            </div>
          </Card>

          {/* Documents */}
          <Card className="p-6 border-t-4 shadow-md" style={{ borderColor: DELIGO }}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FileText className="w-5 h-5" /> 4. Documents & Verification</h2>

            <div className="space-y-4">
              {[
                'ID Proof',
                'Company License',
                'Profile Photo'
              ].map((label) => (
                <div key={label}>
                  <Label>{label}</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <Input type="file" className="cursor-pointer" />
                    <Button variant="outline" className="flex items-center gap-2"><Upload className="w-4 h-4" /> Upload</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Operational Data */}
          <Card className="p-6 border-t-4 shadow-md" style={{ borderColor: DELIGO }}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Truck className="w-5 h-5" /> 5. Operational Data</h2>
            <div>
              <Label>Number of Drivers</Label>
              <Input placeholder="How many drivers?" />
            </div>
          </Card>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-10 flex justify-end">
        <Button className="px-8 py-2 text-white text-base" style={{ background: DELIGO }}>
          Submit Fleet Manager
        </Button>
      </div>
    </div>
  );
}
