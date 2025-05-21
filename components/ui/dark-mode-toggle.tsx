"use client"

import { useEffect, useState } from "react"

export function DarkModeToggle() {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem("theme")
        if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            document.documentElement.classList.add("dark")
            setIsDark(true)
        }
    }, [])

    function toggleDark() {
        setIsDark((prev) => {
            const next = !prev
            if (next) {
                document.documentElement.classList.add("dark")
                localStorage.setItem("theme", "dark")
            } else {
                document.documentElement.classList.remove("dark")
                localStorage.setItem("theme", "light")
            }
            return next
        })
    }

    return (
        <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={toggleDark}
            className="p-2 rounded transition-colors bg-muted hover:bg-accent"
        >
            <span aria-hidden>{isDark ? "🌙" : "☀️"}</span>
        </button>
    )
}