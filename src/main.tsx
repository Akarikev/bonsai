import React from "react";
import ReactDOM from "react-dom/client";
import { DevPanel } from "./devtools/dev-panel";

import { useTreeMiddleware, initTreeState } from "./bonsai/tree";
import { useBonsai, setState, addFlatMiddleware } from "./bonsai/flat";
import { get, set, subscribe } from "./bonsai/tree";
import { createBonsaiStore } from "./bonsai/createStore";
import { useTreeBonsai } from "./bonsai/usetreebonsai";
import {
  createLoggingMiddleware,
  createValidationMiddleware,
  createDebounceMiddleware,
  createPersistenceMiddleware,
} from "./bonsai/middleware";

import { addLog, getLogs } from "./bonsai/devlog";

// ─────────────── Initialize State and Middleware ───────────────

// Initialize tree state with middleware
initTreeState({
  initialState: {
    todos: [],
    filter: "all",
    user: {
      name: "",
      preferences: {
        theme: "light",
        notifications: true,
      },
    },
  },
  middleware: [
    createLoggingMiddleware({ logPath: true, logValue: true }),
    createValidationMiddleware((path, value) => {
      if (
        path === "user/name" &&
        typeof value === "string" &&
        value.length < 2
      ) {
        addLog(`❌ Validation failed: Name must be at least 2 characters long`);
        return "Name must be at least 2 characters long";
      }
      addLog(`✅ Validation passed for path: ${path}`);
      return true;
    }),
    createDebounceMiddleware(300),
    createPersistenceMiddleware("bonsai-playground"),
  ],
});

// Add a global tree middleware for logging
useTreeMiddleware((path, nextVal, oldVal) => {
  addLog(
    `🌳 ${path} changed from ${JSON.stringify(oldVal)} to ${JSON.stringify(
      nextVal
    )}`
  );
  return nextVal;
});

// Create a scoped store for todo stats
const todoStatsStore = createBonsaiStore<{
  totalCompleted: number;
  totalPending: number;
}>();

// ─────────────── Components ───────────────

// Tree State Component
function TodoList() {
  const todos = useTreeBonsai("todos") || [];
  const filter = useTreeBonsai("filter") || "all";
  const theme = useTreeBonsai("user/preferences/theme") || "light";

  const filteredTodos = todos.filter((todo: any) => {
    if (filter === "all") return true;
    if (filter === "completed") return todo.completed;
    if (filter === "active") return !todo.completed;
    return true;
  });

  return (
    <div
      style={{
        padding: 20,
        backgroundColor: theme === "dark" ? "#333" : "#fff",
        color: theme === "dark" ? "#fff" : "#333",
      }}
    >
      <h2>🌳 Tree State Todo List</h2>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => {
            addLog(`🔄 Changing filter to: all`);
            set("filter", "all");
          }}
        >
          All
        </button>
        <button
          onClick={() => {
            addLog(`🔄 Changing filter to: active`);
            set("filter", "active");
          }}
        >
          Active
        </button>
        <button
          onClick={() => {
            addLog(`🔄 Changing filter to: completed`);
            set("filter", "completed");
          }}
        >
          Completed
        </button>
      </div>
      <ul>
        {filteredTodos.map((todo: any, index: number) => (
          <li
            key={index}
            style={{
              textDecoration: todo.completed ? "line-through" : "none",
              marginBottom: 10,
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => {
                const newTodos = [...todos];
                newTodos[index] = { ...todo, completed: !todo.completed };
                addLog(`✅ Toggling todo completion: ${todo.text}`);
                set("todos", newTodos);
              }}
            />
            {todo.text}
            <button
              onClick={() => {
                const newTodos = todos.filter(
                  (_: any, i: number) => i !== index
                );
                addLog(`🗑️ Deleting todo: ${todo.text}`);
                set("todos", newTodos);
              }}
              style={{ marginLeft: 10 }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Add new todo"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value) {
              const newTodos = [
                ...todos,
                {
                  text: e.currentTarget.value,
                  completed: false,
                },
              ];
              addLog(`➕ Adding new todo: ${e.currentTarget.value}`);
              set("todos", newTodos);
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => {
            const newTheme = theme === "light" ? "dark" : "light";
            addLog(`🎨 Switching theme to: ${newTheme}`);
            set("user/preferences/theme", newTheme);
          }}
        >
          Toggle Theme
        </button>
      </div>
    </div>
  );
}

// Flat State Component
function UserProfile() {
  const name = useBonsai((state) => state.name || "");
  const notifications = useBonsai((state) => state.notifications || false);

  return (
    <div style={{ padding: 20, border: "1px solid #ccc", marginTop: 20 }}>
      <h2>🌿 Flat State User Profile</h2>
      <div>
        <label>Name: </label>
        <input
          value={name}
          onChange={(e) => {
            addLog(`👤 Updating name to: ${e.target.value}`);
            setState({ name: e.target.value });
          }}
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => {
              addLog(
                `🔔 ${
                  e.target.checked ? "Enabling" : "Disabling"
                } notifications`
              );
              setState({ notifications: e.target.checked });
            }}
          />
          Enable Notifications
        </label>
      </div>
    </div>
  );
}

// Scoped State Component
function TodoStats() {
  const stats = todoStatsStore.use((state) => state);

  return (
    <div style={{ padding: 20, border: "1px solid #ccc", marginTop: 20 }}>
      <h2>🪴 Scoped State Todo Stats</h2>
      <p>Total Completed: {stats.totalCompleted || 0}</p>
      <p>Total Pending: {stats.totalPending || 0}</p>
    </div>
  );
}

// ─────────────── Main App ───────────────

function App() {
  // Subscribe to todo changes to update stats
  React.useEffect(() => {
    const unsubscribe = subscribe("todos", (todos) => {
      if (!todos) return;

      const totalCompleted = todos.filter((todo: any) => todo.completed).length;
      const totalPending = todos.length - totalCompleted;

      todoStatsStore.set({ totalCompleted, totalPending });
    });

    return () => unsubscribe();
  }, []);

  // Add flat state middleware
  React.useEffect(() => {
    addFlatMiddleware((next, prev) => {
      console.log("[FlatMiddleware] State changing:", { prev, next });
      return next;
    });
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 800, margin: "0 auto" }}>
      <h1>🧪 Bonsai Playground</h1>
      <TodoList />
      <UserProfile />
      <TodoStats />
      <DevPanel />
    </div>
  );
}

// ─────────────── Bootstrap React ───────────────

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
