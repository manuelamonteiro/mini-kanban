"use client";

import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import type { FormEvent, MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Navbar } from "@/components/navbar";
import { Spinner } from "@/components/ui/spinner";

import { AddBoardCard } from "@/app/(app)/home/components/add-board-card";
import { BoardCard } from "@/app/(app)/home/components/board-card";
import { BoardDeleteDialog } from "@/app/(app)/home/components/board-delete-dialog";

import { useAuth } from "@/lib/providers/auth-provider";
import { createBoard, deleteBoard, fetchBoards } from "@/lib/service/boards";
import type { BoardSummary } from "@/lib/types";
import { parseErrorMessage } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<BoardSummary | null>(null);

  const redirectToLogin = () => {
    logout();
    router.replace("/login");
  };

  const handleAuthError = (error: unknown) => {
    if (isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
      redirectToLogin();
      return true;
    }
    return false;
  };

  useEffect(() => {
    setIsAuthChecking(false);
  }, []);

  useEffect(() => {
    if (!isAuthChecking && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthChecking, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let active = true;

    setIsLoadingBoards(true);

    fetchBoards()
      .then((data) => {
        if (!active) return;
        setBoards(data);
      })
      .catch((err) => {
        if (handleAuthError(err)) return;
        toast.error(parseErrorMessage(err));
      })
      .finally(() => {
        if (!active) return;
        setIsLoadingBoards(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const heading = useMemo(() => {
    return boards.length === 0
      ? "Welcome! Want to create your first board?"
      : "Welcome! Here are your boards:";
  }, [boards.length]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  async function handleCreateBoard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCreating) return;

    const name = newBoardName.trim();
    if (name.length < 3) {
      toast.error("Choose a name with at least 3 characters.");
      return;
    }

    setIsCreating(true);

    try {
      const created = await createBoard(name);
  
      setBoards((prev) => [created, ...prev]);

      toast.success(`Board "${created.name}" created.`);
      setCreateDialogOpen(false);
      setNewBoardName("");
      router.push(`/boards/${created.id}`);
    } catch (err) {
      if (handleAuthError(err)) return;
      toast.error(parseErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  }

  function handleDeleteBoard(board: BoardSummary, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    setSelectedBoard(board);
    setDeleteDialogOpen(true);
  }

  async function handleConfirmDeleteBoard() {
    if (!selectedBoard) return;

    const previousBoards = boards;

    setBoards((prev) => prev.filter((b) => b.id !== selectedBoard.id));

    try {
      await deleteBoard(selectedBoard.id);

      toast.success("Board deleted successfully.");
      setDeleteDialogOpen(false);
      setSelectedBoard(null);
    } catch (err) {
      setBoards(previousBoards);
      if (handleAuthError(err)) return;
      toast.error(parseErrorMessage(err));
    }
  }

  if (isAuthChecking || !isAuthenticated || isLoadingBoards) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50 px-4"
        data-testid="home-page-loading"
        id="home-page-loading"
      >
        <div className="flex items-center gap-2 text-slate-700" data-testid="home-loading" id="home-loading">
          <Spinner />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="home-page" id="home-page">
      <Navbar onLogout={handleLogout} />

      <div className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto app-scroll">
        <main className="mx-auto flex w-full min-w-0 flex-col gap-8 px-6 pb-12 pt-4">
          <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 p-6 text-white shadow-xl">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold leading-tight">{heading}</h1>
              <p className="max-w-2xl text-sm text-white/80">
                Create boards to organize tasks, goals, or ideas. Click the “+” card to start or open an existing
                board.
              </p>
            </div>
          </section>

          {isLoadingBoards ? (
            <div className="flex items-center justify-center py-16" data-testid="boards-loading" id="boards-loading">
              <div className="flex items-center gap-2 text-slate-700">
                <Spinner />
                <span className="text-sm">Loading boards...</span>
              </div>
            </div>
          ) : (
            <section
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              data-testid="boards-grid"
              id="boards-grid"
            >
              <AddBoardCard
                open={createDialogOpen}
                onOpenChange={(open) => {
                  setCreateDialogOpen(open);
                  if (!open) setNewBoardName("");
                }}
                onSubmit={handleCreateBoard}
                creating={isCreating}
                name={newBoardName}
                onNameChange={setNewBoardName}
              />

              {boards.map((board) => (
                <BoardCard key={board.id} board={board} onDelete={handleDeleteBoard} />
              ))}
            </section>
          )}
        </main>

        <BoardDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setSelectedBoard(null);
          }}
          boardId={selectedBoard?.id ?? ""}
          boardName={selectedBoard?.name ?? ""}
          onConfirm={handleConfirmDeleteBoard}
        />
      </div>
    </div>
  );
}
