"use client";

import { useState, FormEvent } from "react";

interface TodoInputProps {
  onAdd: (text: string) => void;
}

export default function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText("");
  }

  return (
    <form className="todo-input" onSubmit={handleSubmit}>
      <input
        type="text"
        className="todo-input-field"
        placeholder="Add a new task"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <button type="submit" className="todo-input-button" disabled={!text.trim()}>
        Add
      </button>
    </form>
  );
}
