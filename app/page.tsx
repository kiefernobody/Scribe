"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push("/workspace")
  }, [router])

  return null // This page won't render anything as it immediately redirects
}

