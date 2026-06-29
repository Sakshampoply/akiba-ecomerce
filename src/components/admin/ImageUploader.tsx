"use client"

import { useState, useRef } from "react"
import { Upload, X, Link as LinkIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export type ImageEntry = { url: string; altText?: string }

interface Props {
  images: ImageEntry[]
  onChange: (images: ImageEntry[]) => void
  productId?: string   // if set, persists to DB immediately
  onDelete?: (imageId: string) => void
  savedImages?: { id: string; url: string; altText: string | null }[]
}

export function ImageUploader({ images, onChange, productId, onDelete, savedImages = [] }: Props) {
  const [urlInput, setUrlInput] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setError("")
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? "Upload failed"); setUploading(false); return }
    addUrl(data.url)
    setUploading(false)
    e.target.value = ""
  }

  function addUrl(url: string) {
    if (!url.trim()) return
    onChange([...images, { url: url.trim() }])
    setUrlInput("")
  }

  function removeLocal(idx: number) {
    onChange(images.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4">
      {/* Saved images (edit form only) */}
      {savedImages.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#555577] uppercase tracking-wider mb-2">Current Images</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {savedImages.map((img) => (
              <div key={img.id} className="relative group aspect-square rounded-sm overflow-hidden border border-[#2a2a3d] bg-[#0a0a0f]">
                <Image src={img.url} alt={img.altText ?? ""} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => onDelete?.(img.id)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending new images */}
      {images.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#555577] uppercase tracking-wider mb-2">New Images</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group aspect-square rounded-sm overflow-hidden border border-[#2a2a3d] bg-[#0a0a0f]">
                <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => removeLocal(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload controls */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Paste image URL…"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl(urlInput))}
          />
          <Button type="button" variant="outline" onClick={() => addUrl(urlInput)} className="shrink-0 gap-1.5">
            <LinkIcon className="w-3.5 h-3.5" /> Add URL
          </Button>
        </div>

        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full gap-2"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? "Uploading…" : "Upload from Computer"}
          </Button>
        </div>

        {error && <p className="text-xs text-[#ef4444]">{error}</p>}
      </div>
    </div>
  )
}
