"use client"

import { AlertCircle } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Card } from "@/lib/types"

type CardDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: Card | null
  onConfirm: () => Promise<void>
}

export function CardDeleteDialog({ open, onOpenChange, card, onConfirm }: CardDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleConfirm() {
    setIsDeleting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!isDeleting) onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md" data-testid="card-delete-dialog" id="card-delete-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="size-5" />
            Delete card
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-slate-700">
          Are you sure you want to delete{" "}
          <span className="font-semibold">"{card?.title || "Untitled"}"</span>? This action cannot be undone.
        </p>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
            data-testid="card-delete-cancel"
            id="card-delete-cancel"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            data-testid="card-delete-confirm"
            id="card-delete-confirm"
          >
            {isDeleting ? "Deleting..." : "Delete card"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
