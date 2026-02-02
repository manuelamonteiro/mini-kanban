"use client"

import { Plus } from "lucide-react"
import type React from "react"

import { Button } from "@/components/ui/button"
import type { Card, Column } from "@/lib/types"
import { cn } from "@/lib/utils"

import { BoardCard } from "@/app/(app)/boards/components/card"

type BoardColumnProps = {
  column: Column

  draggingCardId: string | null
  activeColumnId: string | null
  dropBeforeCardId: string | null

  onCreateCard: (columnId: string) => void
  onEditCard: (card: Card) => void
  onDeleteCard: (card: Card) => void

  onCardDragStart: (cardId: string, fromColumnId: string) => void
  onCardDragEnd: () => void
  onCardDragOver: (columnId: string, beforeCardId: string | null) => void
  onCardDrop: (columnId: string, beforeCardId: string | null) => void
}

export function BoardColumn({
  column,
  draggingCardId,
  activeColumnId,
  dropBeforeCardId,
  onCreateCard,
  onEditCard,
  onDeleteCard,
  onCardDragStart,
  onCardDragEnd,
  onCardDragOver,
  onCardDrop,
}: BoardColumnProps) {
  const cards = [...column.cards].sort((a, b) => a.position - b.position)

  function isTarget(beforeCardId: string | null) {
    return String(activeColumnId) === String(column.id) && dropBeforeCardId === beforeCardId
  }

  function handleDropZoneDragOver(event: React.DragEvent<HTMLDivElement>, beforeCardId: string | null) {
    event.preventDefault()
    event.stopPropagation()
    onCardDragOver(String(column.id), beforeCardId)
  }

  function handleDropZoneDrop(event: React.DragEvent<HTMLDivElement>, beforeCardId: string | null) {
    event.preventDefault()
    event.stopPropagation()
    onCardDrop(String(column.id), beforeCardId)
  }

  const firstCardId = cards[0]?.id ?? null

  return (
    <section
      className="flex w-full md:w-[320px] shrink-0 flex-col rounded-2xl bg-white p-4 shadow-sm"
      data-testid={`column-${column.id}`}
      id={`column-${column.id}`}
    >
      <header className="mb-3 flex items-center justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{column.name}</p>
          <p className="text-xs text-slate-500">
            {cards.length} {cards.length === 1 ? "card" : "cards"}
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onCreateCard(String(column.id))}
          className="gap-1"
          data-testid={`column-add-${column.id}`}
          id={`column-add-${column.id}`}
        >
          <Plus className="size-4" />
          Add
        </Button>
      </header>

      <div
        className={cn(
          "flex min-h-[140px] flex-col gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-2",
          "max-h-[calc(100vh-20rem)] overflow-y-auto app-scroll"
        )}
        onDragOver={(event) => handleDropZoneDragOver(event, null)}
        onDrop={(event) => handleDropZoneDrop(event, null)}
        data-testid={`column-body-${column.id}`}
        id={`column-body-${column.id}`}
      >
        <div
          onDragOver={(event) => handleDropZoneDragOver(event, firstCardId)}
          onDrop={(event) => handleDropZoneDrop(event, firstCardId)}
          className={cn("h-2 rounded-md transition", isTarget(firstCardId) && "bg-indigo-200")}
          data-testid={`dropzone-top-${column.id}`}
          id={`dropzone-top-${column.id}`}
        />

        {cards.map((card, idx) => {
          const nextCardId = cards[idx + 1]?.id ?? null

          return (
            <div key={card.id} className="space-y-2">
              <BoardCard
                card={card}
                isDragging={draggingCardId === card.id}
                isDropTarget={isTarget(card.id)}
                onDragStart={() => onCardDragStart(card.id, String(column.id))}
                onDragEnd={onCardDragEnd}
                onDragOver={() => onCardDragOver(String(column.id), card.id)}
                onDrop={() => onCardDrop(String(column.id), card.id)}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
              />

              <div
                onDragOver={(event) => handleDropZoneDragOver(event, nextCardId)}
                onDrop={(event) => handleDropZoneDrop(event, nextCardId)}
                className={cn("h-2 rounded-md transition", isTarget(nextCardId) && "bg-indigo-200")}
                data-testid={`dropzone-after-${column.id}-${card.id}`}
                id={`dropzone-after-${column.id}-${card.id}`}
              />
            </div>
          )
        })}

        {cards.length === 0 ? (
          <p className="py-10 text-center text-xs text-slate-500" data-testid={`column-empty-${column.id}`}>
            Drop a card here or click “Add”.
          </p>
        ) : null}
      </div>
    </section>
  )
}
