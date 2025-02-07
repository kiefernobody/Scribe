"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

const CustomDropdown = PopoverPrimitive.Root

const CustomDropdownTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
      "bg-background hover:bg-primary hover:text-primary-foreground",
      "border border-border/20 shadow-sm",
      "focus:outline-none focus:ring-2 focus:ring-border/20 focus:ring-offset-2",
      className
    )}
    {...props}
  />
))
CustomDropdownTrigger.displayName = PopoverPrimitive.Trigger.displayName

const CustomDropdownContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md p-1",
        "bg-background border border-border/20",
        "shadow-lg shadow-black/10",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      style={{
        minWidth: 'var(--radix-popper-anchor-width)'
      }}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
CustomDropdownContent.displayName = PopoverPrimitive.Content.displayName

const CustomDropdownItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm",
      "outline-none transition-colors",
      "hover:bg-primary hover:text-primary-foreground",
      "focus:bg-primary focus:text-primary-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
))
CustomDropdownItem.displayName = "CustomDropdownItem"

export { CustomDropdown, CustomDropdownTrigger, CustomDropdownContent, CustomDropdownItem }

