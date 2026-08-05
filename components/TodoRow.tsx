"use client";

import { TodoItem } from "@/lib/types";

interface TodoRowProps {
  item: TodoItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function TodoRow({ item, onToggle, onRemove }: TodoRowProps) {
  return (
    <li className={`todo-row${item.completed ? " todo-row-completed" : ""}`}>
      <label className="todo-row-label">
        <input
          type="checkbox"
          className="todo-row-checkbox"
          checked={item.completed}
          onChange={() => onToggle(item.id)}
        />
        <span className="todo-row-text">{item.text}</span>
      </label>
      <button
        type="button"
        className="todo-row-remove"
        onClick={() => onRemove(item.id)}
      >
        ✕
      </button>
    </li>
  );
}
