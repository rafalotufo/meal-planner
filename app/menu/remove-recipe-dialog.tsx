"use client";

import { useEffect, useRef } from 'react';

export default function RemoveRecipeDialog({ title, onCancel, onConfirm }: { title: string; onCancel: () => void; onConfirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const backdrop = useRef(false);
  useEffect(() => {
    const element = dialog.current!;
    element.showModal(); cancel.current?.focus();
    return () => element.close();
  }, []);
  function dismiss() { dialog.current?.close(); onCancel(); }
  return <dialog ref={dialog} aria-labelledby="remove-title" aria-describedby="remove-recipe remove-description"
    onCancel={event => { event.preventDefault(); dismiss(); }}
    onPointerDown={event => { backdrop.current = event.target === event.currentTarget; }}
    onClick={event => {
      const bounds = event.currentTarget.getBoundingClientRect();
      if (backdrop.current && event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dismiss();
    }}
    className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 text-stone-900 shadow-xl backdrop:bg-stone-950/50">
    <h2 id="remove-title" className="font-serif text-2xl leading-tight">Remove recipe from menu?</h2>
    <p id="remove-recipe" className="mt-4 font-semibold break-words">{title}</p>
    <p id="remove-description" className="mt-3 text-sm leading-relaxed text-stone-600">This removes the recipe from your shared family menu. You can add it again from search.</p>
    <div className="mt-6 flex flex-wrap justify-end gap-3">
      <button ref={cancel} data-cancel-removal type="button" onClick={dismiss} className="min-h-11 rounded-lg border border-stone-300 px-4 py-2 font-semibold text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">Cancel</button>
      <button data-confirm-removal type="button" onClick={() => { dialog.current?.close(); onConfirm(); }} className="min-h-11 rounded-lg bg-emerald-900 px-4 py-2 font-semibold text-white hover:bg-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">Remove from menu</button>
    </div>
  </dialog>;
}
