"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

import { useAuth } from "@/lib/providers/auth-provider"
import { fetchBoard } from "@/lib/service/boards"
import { createCard, deleteCard, moveCard, updateCard } from "@/lib/service/cards"
import type { Board, Card, Column } from "@/lib/types"
import { parseErrorMessage } from "@/lib/utils"

import { BoardColumn } from "@/app/(app)/boards/components/board-column"
import { BoardNotFound } from "@/app/(app)/boards/components/board-not-found"
import { CardDeleteDialog } from "@/app/(app)/boards/components/card-delete-dialog"
import { CardEditDialog } from "@/app/(app)/boards/components/card-edit-dialog"

function normalizeCards(cards: Card[]): Card[] {
  return cards.map((c, idx) => ({ ...c, position: idx + 1 }))
}

function applyLocalMove(board: Board, cardId: string, toColumnId: string, destIndex: number): Board {
  let moved: Card | null = null

  const nextColumns: Column[] = board.columns.map((col) => {
    const kept = col.cards.filter((c) => {
      const keep = c.id !== cardId
      if (!keep) moved = c
      return keep
    })

    return { ...col, cards: normalizeCards(kept) }
  })

  if (!moved) return board

  const finalColumns: Column[] = nextColumns.map((col) => {
    if (col.id !== toColumnId) return col

    const safeIndex = Math.max(0, Math.min(destIndex, col.cards.length))
    const nextCards = [...col.cards]
    nextCards.splice(safeIndex, 0, { ...moved!, columnId: toColumnId })

    return { ...col, cards: normalizeCards(nextCards) }
  })

  return { ...board, columns: finalColumns }
}

function getDestinationIndex(args: {
  destCards: Card[]
  draggingCardId: string
  beforeCardId: string | null
  sameColumn: boolean
}): number {
  const { destCards, draggingCardId, beforeCardId, sameColumn } = args

  const list = sameColumn ? destCards.filter((c) => c.id !== draggingCardId) : destCards

  if (!beforeCardId || beforeCardId === draggingCardId) {
    return list.length
  }

  const idx = list.findIndex((c) => c.id === beforeCardId)
  return idx >= 0 ? idx : list.length
}

export default function BoardPage() {
  const params = useParams<{ id?: string }>()
  const boardId = params?.id

  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()

  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const [board, setBoard] = useState<Board | null>(null)
  const [notFound, setNotFound] = useState(false)

  const [draggingCardId, setDraggingCardId] = useState<string | null>(null)
  const [dragFromColumnId, setDragFromColumnId] = useState<string | null>(null)
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null)
  const [dropBeforeCardId, setDropBeforeCardId] = useState<string | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editMode, setEditMode] = useState<"create" | "edit">("create")
  const [editColumnId, setEditColumnId] = useState<string>("")
  const [selectedCard, setSelectedCard] = useState<Card | undefined>(undefined)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteCardTarget, setDeleteCardTarget] = useState<Card | null>(null)

  useEffect(() => {
    setIsAuthChecking(false)
  }, [])

  useEffect(() => {
    if (!isAuthChecking && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthChecking, isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated || !boardId) return

    let active = true
    setIsLoading(true)
    setNotFound(false)

    fetchBoard(boardId)
      .then((data) => {
        if (!active) return
        setBoard(data)
      })
      .catch((err) => {
        const msg = parseErrorMessage(err)

        if (msg.toLowerCase().includes("not found")) {
          setNotFound(true)
          setBoard(null)
          return
        }

        toast.error(msg)
      })
      .finally(() => {
        if (!active) return
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [isAuthenticated, boardId])

  const sortedColumns = useMemo(() => {
    if (!board) return []
    return [...board.columns].sort((a, b) => a.position - b.position)
  }, [board])

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  function handleCardDragStart(cardId: string, fromColumnId: string) {
    setDraggingCardId(cardId)
    setDragFromColumnId(fromColumnId)
  }

  function handleCardDragEnd() {
    setDraggingCardId(null)
    setDragFromColumnId(null)
    setActiveColumnId(null)
    setDropBeforeCardId(null)
  }

  function handleCardDragOver(columnId: string, beforeCardId: string | null) {
    setActiveColumnId(columnId)
    setDropBeforeCardId(beforeCardId)
  }

  async function handleCardDrop(columnId: string, beforeCardId: string | null) {
    if (!board || !draggingCardId) return

    const previous = board
    const destColumn = board.columns.find((c) => c.id === columnId)
    if (!destColumn) return

    const sameColumn = String(dragFromColumnId) === String(columnId)
    const destCards = [...destColumn.cards].sort((a, b) => a.position - b.position)

    const destIndex = getDestinationIndex({
      destCards,
      draggingCardId,
      beforeCardId,
      sameColumn,
    })

    const optimistic = applyLocalMove(board, draggingCardId, columnId, destIndex)
    setBoard(optimistic)

    try {
      await moveCard(draggingCardId, columnId, destIndex + 1)
    } catch (err) {
      setBoard(previous)
      toast.error(parseErrorMessage(err))
    } finally {
      handleCardDragEnd()
    }
  }

  function openCreateCard(columnId: string) {
    setEditMode("create")
    setEditColumnId(columnId)
    setSelectedCard(undefined)
    setEditOpen(true)
  }

  function openEditCard(card: Card) {
    setEditMode("edit")
    setEditColumnId(card.columnId)
    setSelectedCard(card)
    setEditOpen(true)
  }

  function openDeleteCard(card: Card) {
    setDeleteCardTarget(card)
    setDeleteOpen(true)
  }

  async function handleSaveCard(title: string, description: string) {
    if (!board) return

    if (editMode === "create") {
      const columnId = editColumnId

      const created = await createCard(columnId, title, description)

      setBoard((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          columns: prev.columns.map((col) => {
            if (col.id !== columnId) return col
            return { ...col, cards: normalizeCards([...col.cards, created]) }
          }),
        }
      })

      toast.success("Card created.")
      return
    }

    if (!selectedCard) return

    const updated = await updateCard(selectedCard.id, title, description)

    setBoard((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        columns: prev.columns.map((col) => ({
          ...col,
          cards: col.cards.map((c) => (c.id === updated.id ? updated : c)),
        })),
      }
    })

    toast.success("Card updated.")
  }

  async function handleConfirmDeleteCard() {
    if (!board || !deleteCardTarget) return

    const previous = board
    const target = deleteCardTarget

    setBoard((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.id !== target.columnId) return col
          const nextCards = col.cards.filter((c) => c.id !== target.id)
          return { ...col, cards: normalizeCards(nextCards) }
        }),
      }
    })

    try {
      await deleteCard(target.id)
      toast.success("Card deleted.")
      setDeleteOpen(false)
      setDeleteCardTarget(null)
    } catch (err) {
      setBoard(previous)
      toast.error(parseErrorMessage(err))
      throw err
    }
  }

  if (isAuthChecking || !isAuthenticated || isLoading || !boardId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4" data-testid="board-page-loading">
        <div className="flex items-center gap-2 text-slate-700">
          <Spinner />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  if (notFound || !board) {
    return <BoardNotFound />
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="board-page" id="board-page">
      <Navbar onLogout={handleLogout} />

      <div className="fixed inset-x-0 bottom-0 top-16 overflow-hidden">
        <main className="mx-auto flex h-full w-full min-w-0 flex-col gap-6">
          <header className="shrink-0 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 p-5 shadow-sm shadow-indigo-500/20 mt-4 mx-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-white">{board.name}</h1>
                <p className="mt-1 text-sm text-white">
                  Drag cards between columns, or within the same column to reorder.
                </p>
              </div>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="bg-white text-indigo-600 border-white shadow-sm hover:bg-indigo-50 hover:text-indigo-700 focus-visible:ring-indigo-200"
                data-testid="back-home-button"
                id="back-home-button"
              >
                <Link href="/home">Back to home</Link>
              </Button>
            </div>
          </header>

          <section
            className="
              min-h-0 flex-1 app-scroll
              overflow-y-auto overflow-x-hidden
              md:overflow-x-auto md:overflow-y-hidden pb-12
            "
          >
            <div className="h-full px-6 py-2">
              <div
                className="
                  flex gap-4 
                  flex-col pb-6
                  md:flex-row md:w-max md:items-start
                "
                data-testid="board-columns"
                id="board-columns"
              >
                {sortedColumns.map((column) => (
                  <BoardColumn
                    key={column.id}
                    column={column}
                    draggingCardId={draggingCardId}
                    activeColumnId={activeColumnId}
                    dropBeforeCardId={dropBeforeCardId}
                    onCreateCard={openCreateCard}
                    onEditCard={openEditCard}
                    onDeleteCard={openDeleteCard}
                    onCardDragStart={handleCardDragStart}
                    onCardDragEnd={handleCardDragEnd}
                    onCardDragOver={handleCardDragOver}
                    onCardDrop={handleCardDrop}
                  />
                ))}
              </div>
            </div>
          </section>
        </main>

        <CardEditDialog open={editOpen} onOpenChange={setEditOpen} mode={editMode} card={selectedCard} onSave={handleSaveCard} />

        <CardDeleteDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open)
            if (!open) setDeleteCardTarget(null)
          }}
          card={deleteCardTarget}
          onConfirm={handleConfirmDeleteCard}
        />
      </div>
    </div>
  )
}
