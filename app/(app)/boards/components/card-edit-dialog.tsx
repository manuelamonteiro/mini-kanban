"use client"

import { useEffect, useMemo, useState, type ChangeEvent } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Card } from "@/lib/types"

type CardEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  card?: Card
  onSave: (title: string, description: string) => Promise<void>
}

export function CardEditDialog({ open, onOpenChange, mode, card, onSave }: CardEditDialogProps) {
  const isEdit = mode === "edit"

  const initialTitle = useMemo(() => (isEdit && card ? card.title : ""), [isEdit, card])
  const initialDescription = useMemo(() => (isEdit && card ? card.description : ""), [isEdit, card])

  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [saving, setSaving] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setTitle(initialTitle)
    setDescription(initialDescription)
    setSaving(false)
    setFieldError(null)
  }, [open, initialTitle, initialDescription])

  async function handleSave() {
    const cleanTitle = title.trim()
    const cleanDescription = description.trim()

    if (cleanTitle.length < 3) {
      setFieldError("Title must have at least 3 characters.")
      return
    }

    setSaving(true)
    setFieldError(null)

    try {
      await onSave(cleanTitle, cleanDescription)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="card-dialog" id="card-dialog">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit card" : "Create card"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="card-title">
              Title
            </label>
            <Input
              id="card-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
              data-testid="card-title"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="card-description">
              Description (optional)
            </label>
            <Textarea
              id="card-description"
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              disabled={saving}
              rows={4}
              data-testid="card-description"
            />
          </div>

          {fieldError ? (
            <p className="text-sm text-red-600" data-testid="card-dialog-error" id="card-dialog-error">
              {fieldError}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            data-testid="card-dialog-cancel"
            id="card-dialog-cancel"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-200"
            data-testid="card-dialog-save"
            id="card-dialog-save"
          >
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create card"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
