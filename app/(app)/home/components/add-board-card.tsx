import { Plus } from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type AddBoardCardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  creating: boolean;
  name: string;
  onNameChange: (value: string) => void;
};

export function AddBoardCard({ open, onOpenChange, onSubmit, creating, name, onNameChange }: AddBoardCardProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Card
          className="group flex h-32 cursor-pointer items-center justify-center border-2 border-dashed border-indigo-200 bg-white/70 transition hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg"
          data-testid="new-board-trigger"
          id="new-board-trigger"
        >
          <div className="flex flex-col items-center gap-2 text-indigo-600">
            <Plus className="size-12 stroke-[1.5]" />
            <span className="text-sm font-semibold tracking-tight">New board</span>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-sm" data-testid="new-board-dialog" id="new-board-dialog">
        <DialogHeader>
          <DialogTitle>Create board</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit} data-testid="new-board-form" id="new-board-form">
          <Input
            autoFocus
            placeholder="e.g., Q1 roadmap"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={creating}
            data-testid="new-board-name"
            id="new-board-name"
          />

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
              data-testid="new-board-cancel"
              id="new-board-cancel"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={creating}
              className="bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-200"
              data-testid="new-board-submit"
              id="new-board-submit"
            >
              {creating ? "Creating..." : "Create board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
