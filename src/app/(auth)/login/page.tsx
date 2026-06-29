"use client"

import Link from "next/link"
import { Zap, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)
    if (result?.error) {
      setError("Invalid email or password.")
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div className="rounded-sm border border-[#2a2a3d] bg-[#12121a] p-8">
      <h1
        className="text-2xl font-black text-[#f0f0ff] mb-1"
        style={{ fontFamily: "var(--font-syne)" }}
      >
        Welcome back
      </h1>
      <p className="text-sm text-[#555577] mb-8">Sign in to your collector account</p>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-sm bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold tracking-widest uppercase text-[#555577]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#555577] hover:text-[#ff2d55] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" size="lg" className="w-full gap-2 mt-2" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#2a2a3d]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-[#12121a] text-[#555577]">
            Demo: demo@akiba.shop / demo1234
          </span>
        </div>
      </div>

      <p className="text-sm text-center text-[#555577]">
        No account?{" "}
        <Link
          href="/register"
          className="text-[#ff2d55] hover:text-[#ff4d6d] transition-colors font-semibold"
        >
          Create one free
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,45,85,0.06),transparent_60%)]" />
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
        <Suspense fallback={<div className="h-64 rounded-sm border border-[#2a2a3d] bg-[#12121a] animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
