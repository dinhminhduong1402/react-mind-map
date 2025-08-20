import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, CornerDownRight, CornerDownLeft, Trash2, Keyboard } from "lucide-react"

export default function ShortcutBar() {
  const [visible, setVisible] = useState(true)

  const shortcuts = [
    { icon: <Plus size={20} />, key: "Enter", desc: "Thêm node cùng cấp" },
    { icon: <CornerDownRight size={20} />, key: "Tab", desc: "Thêm node con" },
    { icon: <Trash2 size={20} />, key: "Delete", desc: "Xóa node" },
    { icon: <CornerDownLeft size={20} />, key: "Shift+Tab", desc: "Đi lên cấp trên" },
  ]

  return (
    <div className="fixed top-1/2 right-4 -translate-y-1/2 flex flex-col items-center gap-2 z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setVisible(!visible)}
        className="rounded-full shadow-lg bg-white"
      >
        <Keyboard size={20} />
      </Button>

      {visible && (
        <Card className="p-2 flex flex-col items-center gap-3 shadow-lg rounded-2xl">
          <TooltipProvider>
            {shortcuts.map((s, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div className="cursor-pointer text-xs text-align-left">{s.icon}</div>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-sm">
                  <p>
                    <kbd className="px-1 py-0.5 bg-gray-200 rounded text-black">{s.key}</kbd> – {s.desc}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </Card>
      )}
    </div>
  )
}
