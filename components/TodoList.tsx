"use client";

import { TodoItem } from "@/lib/types";
import TodoRow from "@/components/TodoRow";

interface TodoListProps {
  items: TodoItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function TodoList({ items, onToggle, onRemove }: TodoListProps) {
  if (items.length === 0) {
    return <p className="todo-list-empty">Nothing to do yet — add your first item above.</p>;
  }

  return (
    <ul className="todo-list">
      {items.map((item) => (
        <TodoRow key={item.id} item={item} onToggle={onToggle} onRemove={onRemove} />
      ))}
    </ul>
  );
}
