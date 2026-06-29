"use client"

import Link from "next/link"
import { Zap, ArrowRight, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

const PERKS = [
  "10% off your first order with code AKIBA10",
  "Early access to pre-orders",
  "Order tracking & history",
  "Exclusive member sales",
]

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Create account
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Registration failed. Please try again.")
      setLoading(false)
      return
    }

    // Auto sign in after registration
    await signIn("credentials", { email, password, redirect: false })
    router.push("/account")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.06),transparent_60%)]" />
      <div className="relative w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-[#ff2d55]">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              AKIBA<span className="text-[#ff2d55]">.</span>
            </span>
          </Link>
        </div>

        <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-8">
          <h1
            className="text-2xl font-black text-[#f0f0ff] mb-1"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Join the club
          </h1>
          <p className="text-sm text-[#555577] mb-6">Create your collector account</p>

          <div className="grid gap-1.5 mb-6 p-4 rounded-sm bg-[#ff2d55]/5 border border-[#ff2d55]/10">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-start gap-2">
                <Check className="w-3 h-3 text-[#ff2d55] shrink-0 mt-0.5" />
                <span className="text-xs text-[#8888aa]">{perk}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-sm bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-[#555577] block mb-2">
                Full Name
              </label>
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-[#555577] block mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-[#555577] block mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full gap-2 mt-2" disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <p className="text-sm text-center text-[#555577] mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#ff2d55] hover:text-[#ff4d6d] transition-colors font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
