import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"
import { useSyncDataStore } from "@/store/useSyncData";
import {DatabaseBackup, Loader2} from 'lucide-react'
import { useToastStore } from "@/store/useToastStore";
import { useState } from "react";

export function SyncDataModal() {
  const { isOpen, resolveConflict, isSyncing, needUpdateProjects } = useSyncDataStore();
  const {addToast} = useToastStore()
  const [deleteLocal, setDeleteLocal] = useState(false)
  const moveDataToServer: React.MouseEventHandler = (event) => {
    console.log({event});
    resolveConflict('moveToServer', deleteLocal)
      .then(() => {
        addToast("Synced!", 'success')
      })
      .catch((err) => {
        console.log(err)
        addToast("Fail to sync data", 'error')
      })
  }
  
  return (
    <Dialog open={isOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><DatabaseBackup/> Sync Data</DialogTitle>
        </DialogHeader>

        <p>Local data and server data are not in sync. How would you like to proceed?</p>
        {/* Show list of projects that need syncing */}
        {needUpdateProjects?.length > 0 && (
          <div className="mt-4 border rounded-md p-3 bg-muted/30 max-h-40 overflow-y-auto">
            <h4 className="font-medium text-sm mb-2">Projects to sync:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {needUpdateProjects.map((project) => (
                <li key={project.project_id}>
                  <span className="font-semibold">{project.project_title}</span>{" "}
                  <span className="text-muted-foreground text-xs">
                    (id: {project.project_id})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-4">
          <Checkbox
            id="delete-local"
            checked={deleteLocal}
            onCheckedChange={(checked) => setDeleteLocal(!!checked)}
          />
          <label
            htmlFor="delete-local"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            Delete local data after sync
          </label>
        </div>

        <DialogFooter>
          <Button className="cursor-pointer" variant="outline" onClick={() => {resolveConflict('ignoreLocal')}}>
            Unsync
          </Button>
          <Button className="cursor-pointer bg-green-600" onClick={moveDataToServer}>
            {
              isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Move local data to server'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
