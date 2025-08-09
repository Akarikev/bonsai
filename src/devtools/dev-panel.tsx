import React, { memo, useCallback, useMemo } from "react";
import { get, subscribe, set } from "../bonsai/tree";
import { getAllPaths } from "../bonsai/utils";
import { getLogs } from "../bonsai/devlog";

/**
 * Represents a single log entry in the state update history
 */
interface LogEntry {
  timestamp: number;
  path: string;
  value: any;
  previousValue?: any;
}

/**
 * Props for the PathInput component
 */
interface PathInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

/**
 * Props for the ValueInput component
 */
interface ValueInputProps {
  value: any;
  onChange: (value: any) => void;
  path: string;
}

/**
 * Props for the Button component
 */
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

// Memoized component for rendering object properties
const ObjectItem = memo(
  ({
    label,
    value,
    path,
    onUpdate,
    isExpanded,
    onToggleExpand,
  }: {
    label: string;
    value: any;
    path: string;
    onUpdate: (path: string, value: any) => void;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
  }) => {
    const isComplex = typeof value === "object" && value !== null;
    const displayValue = isComplex
      ? Array.isArray(value)
        ? `Array (${value.length})`
        : `Object (${Object.keys(value).length})`
      : String(value);

    const typeColor = useMemo(() => {
      if (Array.isArray(value)) return "#2196F3"; // Blue for arrays
      if (value === null) return "#9E9E9E"; // Grey for null
      switch (typeof value) {
        case "string":
          return "#4CAF50"; // Green for strings
        case "number":
          return "#FF9800"; // Orange for numbers
        case "boolean":
          return "#E91E63"; // Pink for booleans
        case "object":
          return "#9C27B0"; // Purple for objects
        case "undefined":
          return "#9E9E9E"; // Grey for undefined
        default:
          return "#fff";
      }
    }, [value]);

    return (
      <div
        style={{
          padding: "6px 8px",
          margin: "2px 0",
          background: "rgba(0, 0, 0, 0.1)",
          borderRadius: "4px",
          borderLeft: `1px solid ${typeColor}`,
          fontSize: "13px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: isComplex ? "pointer" : "default",
          }}
          onClick={isComplex ? onToggleExpand : undefined}
        >
          <span
            className="bonsai-mono"
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              fontWeight: "500",
            }}
          >
            {label}:
          </span>
          {!isComplex ? (
            <input
              type={typeof value === "number" ? "number" : "text"}
              value={displayValue}
              onChange={(e) => {
                let newValue: any = e.target.value;
                if (typeof value === "number")
                  newValue = parseFloat(newValue) || 0;
                else if (typeof value === "boolean")
                  newValue = e.target.checked;
                onUpdate(path, newValue);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontFamily: "monospace",
                fontSize: "13px",
                outline: "none",
                textAlign: "right",
                flex: 1,
                marginLeft: "10px",
              }}
            />
          ) : (
            <span
              className="bonsai-mono"
              style={{ color: typeColor, marginLeft: "10px" }}
            >
              {displayValue}
            </span>
          )}
          {isComplex && (
            <span style={{ marginLeft: "8px", fontSize: "10px" }}>
              {isExpanded ? "▼" : "►"}
            </span>
          )}
        </div>
        {isComplex && isExpanded && (
          <div style={{ marginLeft: "15px", marginTop: "8px" }}>
            {Array.isArray(value) ? (
              <ArrayView items={value} path={path} onUpdate={onUpdate} />
            ) : (
              <ObjectView data={value} path={path} onUpdate={onUpdate} />
            )}
          </div>
        )}
      </div>
    );
  }
);

// Memoized component for rendering objects
const ObjectView = memo(
  ({
    data,
    path,
    onUpdate,
  }: {
    data: Record<string, any>;
    path: string;
    onUpdate: (path: string, value: any) => void;
  }) => {
    const [expandedPaths, setExpandedPaths] = React.useState<Set<string>>(
      new Set()
    );

    const handleToggleExpand = useCallback((itemPath: string) => {
      setExpandedPaths((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(itemPath)) {
          newSet.delete(itemPath);
        } else {
          newSet.add(itemPath);
        }
        return newSet;
      });
    }, []);

    const sortedKeys = useMemo(() => Object.keys(data).sort(), [data]);

    return (
      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          padding: "4px",
          background: "rgba(0, 0, 0, 0.1)",
          borderRadius: "4px",
          border: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        {sortedKeys.length === 0 ? (
          <div
            className="bonsai-text"
            style={{ color: "rgba(255, 255, 255, 0.5)", padding: "8px" }}
          >
            Empty object
          </div>
        ) : (
          sortedKeys.map((key) => {
            const itemPath = `${path}/${key}`;
            const value = data[key];
            const isExpanded = expandedPaths.has(itemPath);
            return (
              <ObjectItem
                key={itemPath}
                label={key}
                value={value}
                path={itemPath}
                onUpdate={onUpdate}
                isExpanded={isExpanded}
                onToggleExpand={() => handleToggleExpand(itemPath)}
              />
            );
          })
        )}
      </div>
    );
  }
);

// Memoized component for rendering array items
const ArrayItem = memo(
  ({
    value,
    path,
    onUpdate,
  }: {
    value: any;
    path: string;
    onUpdate: (path: string, value: any) => void;
  }) => {
    const isComplex = typeof value === "object" && value !== null;
    const displayValue = isComplex
      ? Array.isArray(value)
        ? `Array (${value.length})`
        : `Object (${Object.keys(value).length})`
      : String(value);

    const typeColor = useMemo(() => {
      if (Array.isArray(value)) return "#2196F3"; // Blue for arrays
      if (value === null) return "#9E9E9E"; // Grey for null
      switch (typeof value) {
        case "string":
          return "#4CAF50"; // Green for strings
        case "number":
          return "#FF9800"; // Orange for numbers
        case "boolean":
          return "#E91E63"; // Pink for booleans
        case "object":
          return "#9C27B0"; // Purple for objects
        case "undefined":
          return "#9E9E9E"; // Grey for undefined
        default:
          return "#fff";
      }
    }, [value]);

    const [isExpanded, setIsExpanded] = React.useState(false);

    const handleToggleExpand = useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue: any = e.target.value;
      if (typeof value === "number") newValue = parseFloat(newValue) || 0;
      else if (typeof value === "boolean") newValue = e.target.checked;
      onUpdate(path, newValue);
    };

    return (
      <div
        style={{
          padding: "4px 8px",
          margin: "2px 0",
          background: "rgba(0, 0, 0, 0.1)",
          borderRadius: "4px",
          borderLeft: `2px solid ${typeColor}`,
          fontSize: "13px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: isComplex ? "pointer" : "default",
          }}
          onClick={isComplex ? handleToggleExpand : undefined}
        >
          <span
            className="bonsai-mono"
            style={{ color: "rgba(255, 255, 255, 0.8)" }}
          >
            {path.split("/").pop()}:
          </span>
          {!isComplex ? (
            <input
              type={typeof value === "number" ? "number" : "text"}
              value={displayValue}
              onChange={handleChange}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontFamily: "monospace",
                fontSize: "13px",
                outline: "none",
                textAlign: "right",
                flex: 1,
                marginLeft: "10px",
              }}
            />
          ) : (
            <span
              className="bonsai-mono"
              style={{ color: typeColor, marginLeft: "10px" }}
            >
              {displayValue}
            </span>
          )}
          {isComplex && (
            <span style={{ marginLeft: "8px", fontSize: "10px" }}>
              {isExpanded ? "▼" : "►"}
            </span>
          )}
        </div>
        {isComplex && isExpanded && (
          <div style={{ marginLeft: "15px", marginTop: "8px" }}>
            {Array.isArray(value) ? (
              <ArrayView items={value} path={path} onUpdate={onUpdate} />
            ) : (
              <ObjectView data={value} path={path} onUpdate={onUpdate} />
            )}
          </div>
        )}
      </div>
    );
  }
);

// Memoized component for rendering arrays
const ArrayView = memo(
  ({
    items,
    path,
    onUpdate,
  }: {
    items: any[];
    path: string;
    onUpdate: (path: string, value: any) => void;
  }) => (
    <div
      style={{
        maxHeight: "200px",
        overflowY: "auto",
        padding: "4px",
        background: "rgba(0, 0, 0, 0.1)",
        borderRadius: "4px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      {items.length === 0 ? (
        <div
          className="bonsai-text"
          style={{ color: "rgba(255, 255, 255, 0.5)", padding: "8px" }}
        >
          Empty array
        </div>
      ) : (
        items.map((item, index) => (
          <ArrayItem
            key={index}
            value={item}
            path={`${path}[${index}]`}
            onUpdate={onUpdate}
          />
        ))
      )}
    </div>
  )
);

// Fun bonsai-themed messages
const BONSAI_MESSAGES = [
  "🌿 Your state is as well-trimmed as a bonsai tree!",
  "🎋 Growing your app state, one branch at a time...",
  "🍃 State changes are like leaves in the wind...",
  "🌳 Your app is branching out beautifully!",
  "🌱 New state sprouting...",
  "🎍 Your code is as elegant as a bonsai!",
  "🌿 State management, the zen way...",
  "🍂 Fallen leaves (logs) tell a story...",
];

// Fun loading messages
const LOADING_MESSAGES = [
  "🌱 Watering the state tree...",
  "🌿 Pruning unnecessary branches...",
  "🎋 Growing new features...",
  "🍃 Raking the state leaves...",
  "🌳 Checking tree health...",
];

/**
 * DevPanel Component
 *
 * A development tool panel for debugging and monitoring Bonsai state management.
 * Provides real-time state visualization, state updates logging, and state inspection capabilities.
 *
 * @component
 * @example
 * ```tsx
 * import { DevPanel } from '@bonsai-ts/state/devtools';
 *
 * function App() {
 *   return (
 *     <div>
 *       <YourApp />
 *       <DevPanel />
 *     </div>
 *   );
 * }
 * ```
 */
export function DevPanel() {
  const [tree, setTree] = React.useState<Record<string, any>>({});
  const [logs, setLogs] = React.useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [filter, setFilter] = React.useState("");
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null);
  const [funMessage, setFunMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  // UI/UX enhancements
  const [activeTab, setActiveTab] = React.useState<
    "state" | "inspector" | "logs" | "settings"
  >("state");
  const [panelTop, setPanelTop] = React.useState<number>(20);
  const [panelRight, setPanelRight] = React.useState<number>(70);
  const [panelWidth, setPanelWidth] = React.useState<number>(420);
  const [panelHeight, setPanelHeight] = React.useState<number>(600);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const dragOffset = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = React.useState<boolean>(false);
  const resizeStart = React.useRef<{
    x: number;
    y: number;
    w: number;
    h: number;
  }>({ x: 0, y: 0, w: 0, h: 0 });
  const [accent, setAccent] = React.useState<string>("#34d399"); // teal
  const [pollMs, setPollMs] = React.useState<number>(500);
  const [paused, setPaused] = React.useState<boolean>(false);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const handleCopy = React.useCallback((key: string, text: string) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1200);
    } catch {
      // ignore clipboard errors
    }
  }, []);

  // Memoize filtered tree to prevent unnecessary recalculations
  const filteredTree = useMemo(() => {
    if (!filter) return tree;
    const lowerFilter = filter.toLowerCase();
    return Object.fromEntries(
      Object.entries(tree).filter(([path]) =>
        path.toLowerCase().includes(lowerFilter)
      )
    );
  }, [tree, filter]);

  // Memoize the update handler
  const handleUpdate = useCallback((path: string, value: any) => {
    set(path, value);
  }, []);

  // Rotate fun messages
  React.useEffect(() => {
    const interval = setInterval(() => {
      setFunMessage(
        BONSAI_MESSAGES[Math.floor(Math.random() * BONSAI_MESSAGES.length)]
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    // Simulate loading
    const loadingTimer = setTimeout(() => setIsLoading(false), 800);

    // Initial state snapshot
    const rawTree = get("");
    const paths = getAllPaths(rawTree);
    const initialValues: Record<string, any> = {};
    paths.forEach((p) => {
      initialValues[p] = get(p);
    });
    setTree(initialValues);

    // Live polling (fallback in addition to subscriptions)
    const poll = setInterval(() => {
      if (paused) return;
      setLogs([...getLogs()]);
      const root = get("");
      const currentPaths = getAllPaths(root);
      const currentValues: Record<string, any> = {};
      currentPaths.forEach((p) => {
        currentValues[p] = get(p);
      });
      setTree(currentValues);
    }, pollMs);

    // Subscriptions
    const unsubs = paths.map((p) =>
      subscribe(p, (val) => {
        if (paused) return;
        setTree((prev) => ({ ...prev, [p]: val }));
      })
    );

    return () => {
      clearInterval(poll);
      clearTimeout(loadingTimer);
      unsubs.forEach((u) => u());
    };
  }, [pollMs, paused]);

  // Hotkey: Ctrl+Shift+B to toggle
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "b"
      ) {
        setIsCollapsed((c) => !c);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Drag handlers (on header)
  const onDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };
  const onMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragOffset.current.x;
        const dy = e.clientY - dragOffset.current.y;
        setPanelRight((r) => Math.max(0, r - dx));
        setPanelTop((t) => Math.max(0, t + dy));
        dragOffset.current = { x: e.clientX, y: e.clientY };
      } else if (isResizing) {
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;
        setPanelWidth(() => Math.max(320, resizeStart.current.w - dx));
        setPanelHeight(() => Math.max(360, resizeStart.current.h + dy));
      }
    },
    [isDragging, isResizing]
  );
  const onMouseUp = React.useCallback(() => {
    if (isDragging) setIsDragging(false);
    if (isResizing) setIsResizing(false);
  }, [isDragging, isResizing]);
  React.useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const onResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: panelWidth,
      h: panelHeight,
    };
    e.preventDefault();
  };

  const renderValueEditor = (path: string, value: any) => {
    if (Array.isArray(value)) {
      return <ArrayView items={value} path={path} onUpdate={handleUpdate} />;
    }

    // Handle objects (non-null)
    if (typeof value === "object" && value !== null) {
      return <ObjectView data={value} path={path} onUpdate={handleUpdate} />;
    }

    const type = typeof value;

    // Handle null or undefined
    if (value === null || value === undefined) {
      return (
        <input
          type="text"
          value=""
          placeholder="null"
          onChange={(e) => set(path, e.target.value)}
          style={{
            width: "80px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "13px",
            padding: "6px 8px",
            borderRadius: "4px",
            fontFamily: "inherit",
          }}
        />
      );
    }

    // Handle boolean
    if (type === "boolean") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => set(path, e.target.checked)}
            style={{
              width: "14px",
              height: "14px",
              cursor: "pointer",
            }}
          />
          <span style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "13px" }}>
            {value.toString()}
          </span>
        </div>
      );
    }

    // Handle number
    if (type === "number") {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const newValue =
              e.target.value === "" ? 0 : parseFloat(e.target.value);
            set(path, newValue);
          }}
          style={{
            width: "80px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff",
            fontSize: "13px",
            padding: "6px 8px",
            borderRadius: "4px",
            fontFamily: "inherit",
          }}
        />
      );
    }

    // Handle string and other types
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => set(path, e.target.value)}
        style={{
          width: "120px",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#fff",
          fontSize: "13px",
          padding: "6px 8px",
          borderRadius: "4px",
          fontFamily: "inherit",
        }}
      />
    );
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap');

          .bonsai-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
          }
          .bonsai-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .bonsai-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
          }
          .bonsai-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
          }
          .bonsai-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
          .bonsai-scrollbar-small {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
          }
          .bonsai-scrollbar-small::-webkit-scrollbar {
            width: 6px;
          }
          .bonsai-scrollbar-small::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
          }
          .bonsai-scrollbar-small::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
          }
          .bonsai-scrollbar-small::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          /* Typography styles */
          .bonsai-title {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            font-weight: 600;
            letter-spacing: -0.02em;
          }
          .bonsai-subtitle {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            font-weight: 500;
            letter-spacing: -0.01em;
          }
          .bonsai-text {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            font-weight: 400;
          }
          .bonsai-mono {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.95em;
          }
        `}
      </style>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "rgba(17, 17, 17, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10000,
          fontSize: "20px",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
          transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.transform = isCollapsed
            ? "rotate(0deg) scale(1.1)"
            : "rotate(180deg) scale(1.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "rgba(17, 17, 17, 0.95)";
          e.currentTarget.style.transform = isCollapsed
            ? "rotate(0deg)"
            : "rotate(180deg)";
        }}
      >
        {isCollapsed ? "🌿" : "🎋"}
      </button>

      {/* Main Panel */}
      {!isCollapsed && (
        <div
          className="bonsai-scrollbar"
          style={{
            position: "fixed",
            top: panelTop,
            right: panelRight,
            width: panelWidth,
            height: panelHeight,
            overflow: "hidden",
            background: "rgba(17, 17, 17, 0.96)",
            backdropFilter: "blur(10px)",
            color: "#fff",
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
            zIndex: 9999,
            border: `1px solid rgba(255, 255, 255, 0.08)`,
            transition: "box-shadow 0.2s ease",
          }}
        >
          {/* Header (draggable) */}
          <div
            onMouseDown={onDragStart}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              padding: "12px 14px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              cursor: "move",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>🎋</span>
              <div>
                <div
                  className="bonsai-title"
                  style={{
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Bonsai DevTools
                  <span style={{ fontSize: 11, opacity: 0.7 }}>v1.1.0</span>
                </div>
                <div
                  className="bonsai-text"
                  style={{ fontSize: 12, opacity: 0.7 }}
                >
                  {funMessage}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPaused((p) => !p);
                }}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: `1px solid rgba(255,255,255,0.12)`,
                  background: paused
                    ? "rgba(255, 99, 71, 0.2)"
                    : "rgba(255,255,255,0.06)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                {paused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCollapsed(true);
                }}
                title="Collapse (Ctrl+Shift+B)"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: `1px solid rgba(255,255,255,0.12)`,
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 6,
              padding: "8px 10px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {[
              { id: "state", label: "State" },
              { id: "inspector", label: "Inspector" },
              { id: "logs", label: "Logs" },
              { id: "settings", label: "Settings" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: `1px solid ${
                    activeTab === t.id ? accent : "rgba(255,255,255,0.12)"
                  }`,
                  background:
                    activeTab === t.id
                      ? "rgba(52, 211, 153, 0.16)"
                      : "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div
            className="bonsai-scrollbar"
            style={{ padding: 12, height: panelHeight - 120, overflow: "auto" }}
          >
            {activeTab === "state" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div style={{ position: "relative", marginBottom: 4 }}>
                  <input
                    placeholder="Search state paths..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bonsai-text"
                    style={{
                      width: "80%",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      fontSize: "14px",
                      padding: "10px 16px",
                      paddingLeft: "40px",
                      borderRadius: "8px",
                      fontFamily: "inherit",
                      transition: "all 0.2s ease",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(255, 255, 255, 0.5)",
                      fontSize: "16px",
                    }}
                  >
                    🔍
                  </span>
                </div>

                {isLoading ? (
                  <div
                    className="bonsai-text"
                    style={{
                      padding: 20,
                      textAlign: "center",
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 14,
                    }}
                  >
                    {
                      LOADING_MESSAGES[
                        Math.floor(Math.random() * LOADING_MESSAGES.length)
                      ]
                    }
                  </div>
                ) : Object.entries(filteredTree).length > 0 ? (
                  Object.entries(filteredTree).map(([path, value]) => (
                    <div
                      key={path}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        padding: 12,
                        background:
                          selectedPath === path
                            ? "rgba(255,255,255,0.10)"
                            : "rgba(255,255,255,0.03)",
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        border: "1px solid rgba(255,255,255,0.05)",
                        marginBottom: 12,
                      }}
                      onClick={() =>
                        setSelectedPath(path === selectedPath ? null : path)
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <label
                          className="bonsai-mono"
                          style={{
                            fontSize: 13,
                            color: "rgba(255,255,255,0.85)",
                            fontWeight: 500,
                            letterSpacing: 0.3,
                            flex: 1,
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {path}
                        </label>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            try {
                              navigator.clipboard?.writeText(path);
                              (window as any).__bonsaiCopied = `path:${path}`;
                              setTimeout(() => {
                                if (
                                  (window as any).__bonsaiCopied ===
                                  `path:${path}`
                                ) {
                                  (window as any).__bonsaiCopied = null;
                                }
                              }, 1200);
                            } catch {}
                          }}
                          title="Copy path"
                          style={{
                            border: "1px solid rgba(255,255,255,0.12)",
                            background:
                              (window as any).__bonsaiCopied === `path:${path}`
                                ? "rgba(52,211,153,0.2)"
                                : "transparent",
                            color:
                              (window as any).__bonsaiCopied === `path:${path}`
                                ? "#34d399"
                                : "#fff",
                            borderRadius: 6,
                            padding: "4px 6px",
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          {(window as any).__bonsaiCopied === `path:${path}`
                            ? "Copied!"
                            : "Copy"}
                        </button>
                        {renderValueEditor(path, value)}
                      </div>
                      {selectedPath === path && (
                        <div
                          className="bonsai-mono"
                          style={{
                            marginTop: 8,
                            padding: 12,
                            background: "rgba(0,0,0,0.2)",
                            borderRadius: 6,
                            fontSize: 13,
                            border: "1px solid rgba(255,255,255,0.05)",
                            maxHeight: 300,
                            overflowY: "auto",
                          }}
                        >
                          <div
                            style={{
                              color: "rgba(255,255,255,0.65)",
                              marginBottom: 8,
                              fontSize: 12,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span>
                              Type:{" "}
                              <strong>
                                {Array.isArray(value) ? "array" : typeof value}
                              </strong>
                            </span>
                            {Array.isArray(value) && (
                              <span>
                                Length: <strong>{value.length}</strong>
                              </span>
                            )}
                          </div>
                          {Array.isArray(value) ? (
                            <ArrayView
                              items={value}
                              path={path}
                              onUpdate={handleUpdate}
                            />
                          ) : typeof value === "object" && value !== null ? (
                            <pre
                              style={{
                                margin: 0,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                fontSize: 12,
                                lineHeight: 1.4,
                                color: "rgba(255,255,255,0.85)",
                              }}
                            >
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          ) : (
                            <div
                              style={{
                                padding: 8,
                                background: "rgba(0,0,0,0.1)",
                                borderRadius: 4,
                                fontFamily: "monospace",
                                fontSize: 13,
                              }}
                            >
                              {String(value)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div
                    className="bonsai-text"
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 14,
                      padding: 20,
                      textAlign: "center",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    {filter
                      ? "🌿 No matching paths found..."
                      : "🌱 No state paths available yet..."}
                  </div>
                )}
              </div>
            )}

            {activeTab === "inspector" && (
              <div>
                <div
                  className="bonsai-text"
                  style={{
                    marginBottom: 8,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {selectedPath
                    ? `Inspecting: ${selectedPath}`
                    : "Select a path from the State tab."}
                </div>
                {selectedPath && (
                  <div
                    style={{
                      padding: 12,
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {renderValueEditor(selectedPath, tree[selectedPath])}
                    <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                      <button
                        onClick={() =>
                          navigator.clipboard?.writeText(selectedPath)
                        }
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "transparent",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Copy Path
                      </button>
                      <button
                        onClick={() =>
                          navigator.clipboard?.writeText(
                            JSON.stringify(tree[selectedPath], null, 2)
                          )
                        }
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "transparent",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Copy Value
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "logs" && (
              <div
                className="bonsai-scrollbar-small bonsai-mono"
                style={{
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: 8,
                  padding: 12,
                  maxHeight: panelHeight - 160,
                  overflowY: "auto",
                  fontSize: 12,
                  lineHeight: 1.5,
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {logs.length ? (
                  logs.map((log, i) => (
                    <div
                      key={i}
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        marginBottom: 8,
                        padding: "4px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {log}
                    </div>
                  ))
                ) : (
                  <div
                    className="bonsai-text"
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      textAlign: "center",
                      padding: "20px 0",
                    }}
                  >
                    🌿 No logs yet... Your bonsai is still growing!
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    className="bonsai-subtitle"
                    style={{
                      marginBottom: 6,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    Accent
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      "#34d399",
                      "#60a5fa",
                      "#f59e0b",
                      "#ef4444",
                      "#a78bfa",
                    ].map((c) => (
                      <button
                        key={c}
                        onClick={() => setAccent(c)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          border: `2px solid ${
                            accent === c ? "#fff" : "rgba(255,255,255,0.2)"
                          }`,
                          background: c,
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div
                    className="bonsai-subtitle"
                    style={{
                      marginBottom: 6,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    Polling (ms)
                  </div>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={pollMs}
                    onChange={(e) =>
                      setPollMs(Math.max(100, Number(e.target.value) || 500))
                    }
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "6px 8px",
                    }}
                  />
                </div>
                <div
                  style={{
                    gridColumn: "1 / -1",
                    marginTop: 6,
                    fontSize: 12,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Hotkey: Ctrl+Shift+B to toggle panel visibility
                </div>
              </div>
            )}
          </div>

          {/* Resize handle */}
          <div
            onMouseDown={onResizeStart}
            title="Resize"
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              width: 14,
              height: 14,
              borderRight: `2px solid ${accent}`,
              borderBottom: `2px solid ${accent}`,
              borderRadius: 2,
              cursor: "nwse-resize",
              opacity: 0.8,
            }}
          />
        </div>
      )}
    </>
  );
}

/**
 * StateTree Component
 *
 * Renders a collapsible tree view of the current state.
 * Allows inspection of nested state objects and their values.
 *
 * @component
 * @param {Object} props - Component props
 * @param {any} props.data - The state data to display
 * @param {string} props.path - The current path in the state tree
 */
function StateTree({ data, path }: { data: any; path: string }) {
  // ... existing code ...
}

/**
 * LogViewer Component
 *
 * Displays a chronological list of state updates and changes.
 * Shows timestamps, paths, and values for each state change.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array<LogEntry>} props.logs - Array of log entries to display
 */
function LogViewer({ logs }: { logs: LogEntry[] }) {
  // ... existing code ...
}

/**
 * StateInspector Component
 *
 * Provides detailed inspection of state values at a specific path.
 * Shows the current value and allows modification through the UI.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.path - The path to inspect
 * @param {any} props.value - The current value at the path
 */
function StateInspector({ path, value }: { path: string; value: any }) {
  // ... existing code ...
}

/**
 * PathInput Component
 *
 * Input field for entering state paths with validation and autocomplete.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.value - Current path value
 * @param {Function} props.onChange - Callback when path changes
 * @param {Function} props.onSubmit - Callback when path is submitted
 */
function PathInput({ value, onChange, onSubmit }: PathInputProps) {
  // ... existing code ...
}

/**
 * ValueInput Component
 *
 * Input field for modifying state values with type-aware editing.
 *
 * @component
 * @param {Object} props - Component props
 * @param {any} props.value - Current value
 * @param {Function} props.onChange - Callback when value changes
 * @param {string} props.path - The path being edited
 */
function ValueInput({ value, onChange, path }: ValueInputProps) {
  // ... existing code ...
}

/**
 * Button Component
 *
 * Styled button component with hover and active states.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} [props.className] - Additional CSS classes
 */
function Button({ children, onClick, className = "" }: ButtonProps) {
  // ... existing code ...
}
