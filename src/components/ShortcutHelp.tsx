import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, CornerDownRight, CornerDownLeft, Trash2, Lightbulb  } from "lucide-react"
import { Button } from "./ui/button"

export default function ShortcutBar() {
  const helpIcon = <Lightbulb size={20} />
  const shortcuts = [
    { icon: <Plus size={20} />, key: "Enter", desc: "Thêm node cùng cấp" },
    { icon: <CornerDownRight size={20} />, key: "Tab", desc: "Thêm node con" },
    { icon: <Trash2 size={20} />, key: "Delete", desc: "Xóa node" },
    { icon: <CornerDownLeft size={20} />, key: "Shift+Tab", desc: "Đi lên cấp trên" },
  ]

  return (
    <div className="fixed top-1/2 right-4 -translate-y-1/2 flex flex-col items-center gap-2 z-100 shadow rounded-full">
      <TooltipProvider>
          <Tooltip>
              <TooltipTrigger asChild>
                <Button className="text-yellow-400 bg-transparent rounded-full">{helpIcon}</Button>
              </TooltipTrigger>

              <TooltipContent side="left" className="text-sm">
                {shortcuts.map(s => 
                  
                    <p className="pt-3 pb-3" key={s.key}>
                      <kbd className="px-1 py-0.5 bg-gray-200 rounded text-black">{s.key}</kbd> – {s.desc}
                    </p>
                  
                )}
              </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
  )
}
