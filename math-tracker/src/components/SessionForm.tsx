"use client";

import { useRef, useState, useTransition } from "react";
import { createSession } from "@/app/dashboard/actions";
import { CONTESTS } from "@/lib/contests";

export function SessionForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createSession(formData);
        formRef.current?.reset();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="rounded-lg border border-ink/15 bg-paper p-6 space-y-5"
    >
      <div>
        <label htmlFor="contest" className="block text-sm font-medium text-ink mb-1">
          Contest
        </label>
        <select
          id="contest"
          name="contest"
          required
          className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-ink"
        >
          {CONTESTS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="hours" className="block text-sm font-medium text-ink mb-1">
          Hours spent <span className="text-ink/50">(optional, half-hour steps)</span>
        </label>
        <input
          id="hours"
          name="hours"
          type="number"
          step="0.5"
          min="0.5"
          max="8"
          placeholder="e.g. 1.5"
          className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-ink"
        />
      </div>

      <div>
        <label htmlFor="photos" className="block text-sm font-medium text-ink mb-1">
          Photos of your work
        </label>
        <input
          id="photos"
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          required
          className="w-full text-sm text-ink/80"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-ink px-4 py-2 text-paper font-medium disabled:opacity-50"
      >
        {isPending ? "Grading your work…" : "Submit session"}
      </button>
    </form>
  );
}
