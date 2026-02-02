"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type BoardDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  boardName: string;
  onConfirm: () => Promise<void>;
};

export function BoardDeleteDialog({ open, onOpenChange, boardId, boardName, onConfirm }: BoardDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!isDeleting) onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md" data-testid="board-delete-dialog" id="board-delete-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="size-5" />
            Delete board
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete the board <span className="font-semibold">"{boardName}"</span>?
          </p>

          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <p className="font-semibold">Warning:</p>
            <p>This will permanently delete all columns and cards within this board. This action cannot be undone.</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
            data-testid="board-delete-cancel"
            id="board-delete-cancel"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting || !boardId}
            data-testid="board-delete-confirm"
            id="board-delete-confirm"
          >
            {isDeleting ? "Deleting..." : "Delete board"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
