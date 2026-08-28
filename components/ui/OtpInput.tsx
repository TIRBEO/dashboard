"use client"
import * as React from "react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

// 21st dev wrapper — old custom OtpInput API now backed by shadcn input-otp (21st)
export function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  return (
    <InputOTP maxLength={length} value={value} onChange={onChange}>
      <InputOTPGroup>
        {Array.from({ length }).map((_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}
export default OtpInput
