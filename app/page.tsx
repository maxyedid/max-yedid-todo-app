"use client";

import { useState } from "react";
import TodoInput from "@/components/TodoInput";
import TodoList from "@/components/TodoList";
import { TodoItem } from "@/lib/types";

export default function Home() {
  const initialItems: TodoItem[] = [
    { id: crypto.randomUUID(), text: "Complete interview with Tabs", completed: true },
    { id: crypto.randomUUID(), text: "Build a to-do list app using all the tools at your disposal", completed: true },
    { id: crypto.randomUUID(), text: "Advance to the next round at Tabs", completed: false },
    { id: crypto.randomUUID(), text: "Crank out more code", completed: false },
  ];

  const [items, setItems] = useState<TodoItem[]>(initialItems);

  function handleAdd(text: string) {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), text, completed: false }]);
  }

  function handleToggle(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  }

  function handleRemove(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const remaining = items.filter((item) => !item.completed).length;

  return (
    <main className="page">
      <div className="todo-card">
        <h1 className="todo-card-title">Max's To-Do List</h1>
        <TodoInput onAdd={handleAdd} />
        <TodoList items={items} onToggle={handleToggle} onRemove={handleRemove} />
        {items.length > 0 && (
          <p className="todo-card-footer">
            {remaining} {remaining === 1 ? "item" : "items"} left
          </p>
        )}
      </div>
    </main>
  );
}
