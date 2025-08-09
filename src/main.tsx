import React from "react";
import ReactDOM from "react-dom/client";

import { useBonsai, setState, addFlatMiddleware } from "./bonsai/flat";
import { createBonsaiStore, createStore } from "./bonsai/createStore";
import {
  createLoggingMiddleware,
  createValidationMiddleware,
  createDebounceMiddleware,
  createPersistenceMiddleware,
} from "./bonsai/middleware";

import { addLog } from "./bonsai/devlog";

// ─────────────── Initialize Tree Store (with DevTools + Middleware) ───────────────
export const appStore = createStore(
  {
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
  {
    devtools: true,
    middleware: [
      createLoggingMiddleware({ logPath: true, logValue: true }),
      createValidationMiddleware((path, value) => {
        if (
          path === "user/name" &&
          typeof value === "string" &&
          value.length < 2
        ) {
          addLog(
            `❌ Validation failed: Name must be at least 2 characters long`
          );
          return "Name must be at least 2 characters long";
        }
        addLog(`✅ Validation passed for path: ${path}`);
        return true;
      }),
      createDebounceMiddleware(300),
      createPersistenceMiddleware("bonsai-playground"),
    ],
  }
);

// Additional logging middleware (previously useTreeMiddleware)
appStore.addMiddleware((path, nextVal, oldVal) => {
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
  const todos = appStore.use<any[]>("todos") || [];
  const filter = appStore.use<string>("filter") || "all";
  const name = appStore.use<string>("user/name") || "";
  const theme = appStore.use<string>("user/preferences/theme") || "light";

  const filteredTodos = React.useMemo(() => {
    return todos.filter((todo: any) => {
      if (filter === "all") return true;
      if (filter === "completed") return todo.completed;
      if (filter === "active") return !todo.completed;
      return true;
    });
  }, [todos, filter]);

  const handleToggleTodo = React.useCallback(
    async (index: number, todo: any) => {
      const newTodos = [...todos];
      newTodos[index] = { ...todo, completed: !todo.completed };
      addLog(`✅ Toggling todo completion: ${todo.text}`);
      await appStore.set("todos", newTodos);
    },
    [todos]
  );

  const handleDeleteTodo = React.useCallback(
    async (index: number, todo: any) => {
      const newTodos = todos.filter((_: any, i: number) => i !== index);
      addLog(`🗑️ Deleting todo: ${todo.text}`);
      await appStore.set("todos", newTodos);
    },
    [todos]
  );

  const handleAddTodo = React.useCallback(
    async (text: string) => {
      const newTodos = [
        ...todos,
        {
          text,
          completed: false,
        },
      ];
      addLog(`➕ Adding new todo: ${text}`);
      await appStore.set("todos", newTodos);
    },
    [todos]
  );

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
            appStore.set("filter", "all");
          }}
        >
          All
        </button>
        <button
          onClick={() => {
            addLog(`🔄 Changing filter to: active`);
            appStore.set("filter", "active");
          }}
        >
          Active
        </button>
        <button
          onClick={() => {
            addLog(`🔄 Changing filter to: completed`);
            appStore.set("filter", "completed");
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
              onChange={() => handleToggleTodo(index, todo)}
            />
            {todo.text}
            <button
              onClick={() => handleDeleteTodo(index, todo)}
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
              handleAddTodo(e.currentTarget.value);
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
            appStore.set("user/preferences/theme", newTheme);
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
            appStore.set("user/name", e.target.value);
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
    const unsubscribe = appStore.subscribe("todos", (todos) => {
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
    </div>
  );
}

// ─────────────── Bootstrap React ───────────────

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
