import { LayoutGrid, Trash2 } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { BoardSummary } from "@/lib/types";

type BoardCardProps = {
  board: BoardSummary;
  onDelete: (board: BoardSummary, event: MouseEvent) => void;
};

export function BoardCard({ board, onDelete }: BoardCardProps) {
  return (
    <Link
      href={`/boards/${board.id}`}
      className="group block"
      data-testid={`board-link-${board.id}`}
      id={`board-link-${board.id}`}
    >
      <Card
        className="relative flex h-32 flex-col justify-center transition hover:-translate-y-1 hover:shadow-lg"
        data-testid={`board-card-${board.id}`}
        id={`board-card-${board.id}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 pr-12 text-lg font-semibold text-slate-900">
            <LayoutGrid className="size-4 text-indigo-500" />
            {board.name}
          </CardTitle>
        </CardHeader>

        <div className="absolute right-3 top-3 flex opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => onDelete(board, e)}
            className="rounded p-1.5 text-slate-400 transition hover:bg-red-100 hover:text-red-600 cursor-pointer"
            aria-label="Delete board"
            type="button"
            data-testid={`board-delete-${board.id}`}
            id={`board-delete-${board.id}`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </Card>
    </Link>
  );
}
