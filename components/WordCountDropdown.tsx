"use client"

import { useState, useEffect, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Break } from "@/types/editor"
import { CustomDropdown } from "@/components/ui/custom-dropdown"

interface WordCountDropdownProps {
  totalWordCount: number
  breaks: Break[]
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onClose: () => void
}

export function WordCountDropdown({ totalWordCount, breaks, isOpen, setIsOpen, onClose }: WordCountDropdownProps) {
  const [dayWordCount, setDayWordCount] = useState(0)
  const [sessionWordCount, setSessionWordCount] = useState(0)
  const [fiveMinuteWordCount, setFiveMinuteWordCount] = useState(0)
  const [userIsStuck, setUserIsStuck] = useState(false)

  useEffect(() => {
    // Initialize counts from local storage
    const storedDayCount = (() => { try { return localStorage.getItem("dayWordCount")
    const storedDayDate = (() => { try { return localStorage.getItem("dayWordCountDate")
    const today = new Date().toDateString()

    if (storedDayCount && storedDayDate === today) {
      setDayWordCount(Number.parseInt(storedDayCount, 10))
    } else {
      localStorage.setItem("dayWordCount", "0")
      localStorage.setItem("dayWordCountDate", today)
    }

    const storedSessionCount = (() => { try { return localStorage.getItem("sessionWordCount")
    if (storedSessionCount) {
      setSessionWordCount(Number.parseInt(storedSessionCount, 10))
    } else {
      localStorage.setItem("sessionWordCount", "0")
    }

    // Set up interval for 5-minute word count
    const interval = setInterval(() => {
      setFiveMinuteWordCount(0)
    }, 300000) // Reset every 5 minutes

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Update counts when total word count changes
    const prevTotal = Number.parseInt((() => { try { return localStorage.getItem("prevTotalWordCount") || "0", 10)
    const diff = totalWordCount - prevTotal

    if (diff > 0) {
      const newDayCount = dayWordCount + diff
      const newSessionCount = sessionWordCount + diff
      const newFiveMinuteCount = fiveMinuteWordCount + diff

      setDayWordCount(newDayCount)
      setSessionWordCount(newSessionCount)
      setFiveMinuteWordCount(newFiveMinuteCount)

      localStorage.setItem("dayWordCount", newDayCount.toString())
      localStorage.setItem("sessionWordCount", newSessionCount.toString())
      localStorage.setItem("prevTotalWordCount", totalWordCount.toString())

      // Check if user is stuck
      setUserIsStuck(newFiveMinuteCount < 15)
    }
  }, [totalWordCount, dayWordCount, sessionWordCount, fiveMinuteWordCount])

  const breaksList = useMemo(
    () =>
      breaks.map((breakItem) => (
        <li key={breakItem.id} className="flex justify-between">
          <span>{breakItem.title}:</span>
          <span>{breakItem.wordCount} words</span>
        </li>
      )),
    [breaks],
  )

  const triggerContent = <span className="truncate text-xs font-medium w-24 text-center">Words: {totalWordCount}</span>

  const dropdownContent = (
    <ScrollArea className="h-64 w-full bg-background rounded-md shadow-lg overflow-hidden">
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-2 text-foreground">Project Statistics</h3>
          <ul className="text-xs space-y-2 text-muted-foreground">
            <li className="flex justify-between">
              <span>Total:</span>
              <span>{totalWordCount} words</span>
            </li>
            <li className="flex justify-between">
              <span>Today:</span>
              <span>{dayWordCount} words</span>
            </li>
            <li className="flex justify-between">
              <span>This session:</span>
              <span>{sessionWordCount} words</span>
            </li>
            <li className="flex justify-between">
              <span>Last 5 minutes:</span>
              <span>{fiveMinuteWordCount} words</span>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-sm mb-2 text-foreground">Breaks</h3>
          <ul className="text-xs space-y-2 text-muted-foreground">{breaksList}</ul>
        </div>
      </div>
    </ScrollArea>
  )

  return (
    <div className="h-10">
      <CustomDropdown
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        triggerContent={triggerContent}
        dropdownContent={dropdownContent}
        className="w-full h-full flex-shrink-0 bg-dark-gray"
        dropdownClassName="w-64 left-0 mt-1"
        expandDirection="right"
        onClose={onClose}
      />
    </div>
  )
}

