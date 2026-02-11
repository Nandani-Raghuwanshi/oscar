import React, { useEffect, useState } from 'react'

export default function Loader() {
    const [percent, setPercent] = useState(0)

    useEffect(() => {
        let mounted = true
        let current = 0
        const tick = () => {
            if (!mounted) return
            // increase quickly then slow down
            const delta = current < 50 ? Math.random() * 8 + 6 : Math.random() * 4 + 1
            current = Math.min(95, current + delta)
            setPercent(Math.floor(current))
            if (current < 95) timer = setTimeout(tick, 120)
        }

        let timer = setTimeout(tick, 80)

        return () => {
            mounted = false
            clearTimeout(timer)
        }
    }, [])

    return (
        <div className="loader-overlay">
            <div className="loader-box">
                <div className="loader-gif" aria-hidden>
                    <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="45" stroke="#e6f0ff" strokeWidth="10" />
                        <path d="M50 15 a35 35 0 0 1 0 70" stroke="#60a5fa" strokeWidth="10" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="progress">
                    <div className="progress-bar" style={{ width: `${percent}%` }} />
                </div>

                <div className="percent">{percent}%</div>
            </div>
        </div>
    )
}
