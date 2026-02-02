"use client"

import { KanbanSquare } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function BoardNotFound() {
  return (
    <div
      className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4"
      data-testid="board-not-found"
      id="board-not-found"
    >
      <Card className="w-full max-w-md border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
          <KanbanSquare className="size-6" aria-hidden />
        </div>

        <h2 className="text-lg font-semibold text-slate-900">Board not found</h2>
        <p className="mt-1 text-sm text-slate-600">
          The board may have been deleted or you might not have access.
        </p>

        <div className="mt-6 flex justify-center">
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700" data-testid="back-home" id="back-home">
            <Link href="/home">Back to Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
