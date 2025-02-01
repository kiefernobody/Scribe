import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export default function ActionButtons() {
  return (
    <div className="flex flex-col space-y-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="w-12 h-12 rounded-xl bg-[#F5F5F5] text-[#252525] hover:bg-primary hover:text-[#F5F5F5] text-xl font-bold"
          >
            C
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Chapter Review</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="w-12 h-12 rounded-xl bg-[#F5F5F5] text-[#252525] hover:bg-primary hover:text-[#F5F5F5] text-xl font-bold"
          >
            D
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Draft Review</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="w-12 h-12 rounded-xl bg-[#F5F5F5] text-[#252525] hover:bg-primary hover:text-[#F5F5F5] text-xl font-bold"
          >
            S
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Stuck</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

