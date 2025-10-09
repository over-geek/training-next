"use client"

import * as React from "react"
import { Check, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"

interface FilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  color?: string
}

interface FilterPopoverProps {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  iconColor?: string
  iconBgColor?: string
  options: FilterOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function FilterPopover({
  title,
  icon: Icon,
  options,
  value,
  onValueChange,
  placeholder,
}: FilterPopoverProps) {
  const [open, setOpen] = useState(false)
  
  const selectedOption = options.find(option => option.value === value)
  const hasSelection = value && value !== "all" && value !== ""

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" className="px-2 h-8 border border-dashed"
        >
          <div className="flex items-center gap-2">
            {Icon && (
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center")}>
                <Icon className={cn("h-3 w-3")} />
              </div>
            )}
            <span className="text-sm font-medium">{title}</span>
            {hasSelection && (
              <>
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <Badge variant="secondary" className="rounded-sm px-1 font-normal text-xs">
                  {selectedOption?.label || value}
                </Badge>
              </>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder || `Search ${title.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value === option.value
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      onValueChange(option.value)
                      setOpen(false)
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {hasSelection && (
              <>
                <div className="border-t border-border my-1" />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onValueChange("all")
                      setOpen(false)
                    }}
                    className="justify-center text-center"
                  >
                    Clear filter
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
