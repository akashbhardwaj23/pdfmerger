'use client'

import { useEffect, useRef } from 'react'

interface FloatingShapeProps {
  color: string
  top?: string
  left?: string
  right?: string
  bottom?: string
  size: number
  duration: number
}

export default function FloatingShape({ color, top, left, right, bottom, size, duration }: FloatingShapeProps) {
  const shapeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const shape = shapeRef.current
    if (!shape) return

    const animatePosition = () => {
      const newX = Math.random() * 20 - 10 // Move up to 10px in either direction
      const newY = Math.random() * 20 - 10

      shape.animate(
        [
          { transform: 'translate(0, 0)' },
          { transform: `translate(${newX}px, ${newY}px)` },
        ],
        {
          duration: duration * 1000,
          easing: 'ease-in-out',
          fill: 'both',
        }
      ).onfinish = animatePosition
    }

    animatePosition()
  }, [duration])

  return (
    <div
      ref={shapeRef}
      className="absolute rounded-full mix-blend-multiply filter blur-xl opacity-70"
      style={{
        backgroundColor: color,
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
      }}
    />
  )
}

