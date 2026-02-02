"use client"

import { GripVertical, Pencil, Trash2 } from "lucide-react"
import type React from "react"

import type { Card as KanbanCard } from "@/lib/types"
import { cn } from "@/lib/utils"

type BoardCardProps = {
  card: KanbanCard
  isDragging?: boolean
  isDropTarget?: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void
  onEdit?: (card: KanbanCard) => void
  onDelete?: (card: KanbanCard) => void
}

export function BoardCard({
  card,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onEdit,
  onDelete,
}: BoardCardProps) {
  function handleEdit(event: React.MouseEvent) {
    event.stopPropagation()
    onEdit?.(card)
  }

  function handleDelete(event: React.MouseEvent) {
    event.stopPropagation()
    onDelete?.(card)
  }

  return (
    <div
      role="article"
      tabIndex={0}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", card.id)
        event.dataTransfer.effectAllowed = "move"

        event.stopPropagation()
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onDragOver(event)
      }}
      onDrop={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onDrop(event)
      }}
      className={cn(
        "group relative rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300",
        isDragging && "opacity-50 shadow-none ring-2 ring-indigo-200",
        isDropTarget && "border-indigo-400 ring-2 ring-indigo-200"
      )}
      data-testid={`card-${card.id}`}
      id={`card-${card.id}`}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-slate-400" aria-hidden>
          <GripVertical className="size-4" />
        </span>

        <div className="flex-1 space-y-1">
          <p className="pr-12 text-sm font-semibold text-slate-800">{card.title || "Untitled"}</p>
          {card.description ? <p className="line-clamp-3 text-xs text-slate-600">{card.description}</p> : null}
        </div>
      </div>

      {onEdit || onDelete ? (
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit ? (
            <button
              type="button"
              onClick={handleEdit}
              className="cursor-pointer rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600"
              aria-label="Edit card"
              data-testid={`card-edit-${card.id}`}
              id={`card-edit-${card.id}`}
            >
              <Pencil className="size-3.5" />
            </button>
          ) : null}

          {onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              className="cursor-pointer rounded p-1 text-slate-400 transition hover:bg-red-100 hover:text-red-600"
              aria-label="Delete card"
              data-testid={`card-delete-${card.id}`}
              id={`card-delete-${card.id}`}
            >
              <Trash2 className="size-3.5" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
