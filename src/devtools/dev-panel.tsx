import React from "react";
import { get, subscribe, set } from "../bonsai/tree";
import { getAllPaths } from "../bonsai/utils";
import { getLogs } from "../bonsai/devlog";

export function DevPanel() {
  const [tree, setTree] = React.useState<Record<string, any>>({});
  const [logs, setLogs] = React.useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [filter, setFilter] = React.useState("");
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Set up interval to fetch logs and update state tree
    const interval = setInterval(() => {
      setLogs(getLogs());
      // Get fresh state tree on each interval
      const rawTree = get("");
      const paths = getAllPaths(rawTree);
      const currentValues: Record<string, any> = {};
      paths.forEach((path) => {
        currentValues[path] = get(path);
      });
      setTree(currentValues);
    }, 500);

    // Initial state setup
    const rawTree = get("");
    const paths = getAllPaths(rawTree);
    const initialValues: Record<string, any> = {};
    paths.forEach((path) => {
      initialValues[path] = get(path);
    });
    setTree(initialValues);

    // Subscribe to all paths
    const unsubs = paths.map((path) =>
      subscribe(path, (val) => {
        setTree((prev) => ({ ...prev, [path]: val }));
      })
    );

    return () => {
      clearInterval(interval);
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // Debug log to check what we're getting
  //   console.log("Current tree state:", tree);

  const renderValueEditor = (path: string, value: any) => {
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

    // Handle objects and arrays
    if (type === "object") {
      const stringified = JSON.stringify(value, null, 2);
      return (
        <textarea
          value={stringified}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              set(path, parsed);
            } catch {
              // If JSON is invalid, just update the string value
              set(path, e.target.value);
            }
          }}
          style={{
            width: "100%",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff",
            fontSize: "13px",
            padding: "8px",
            borderRadius: "4px",
            fontFamily: "monospace",
            minHeight: "60px",
            resize: "vertical",
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
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "rgba(17, 17, 17, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10000,
          fontSize: "16px",
          transition: "all 0.2s ease",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "rgba(17, 17, 17, 0.95)";
        }}
      >
        {isCollapsed ? "🌿" : "❌"}
      </button>

      {/* Main Panel */}
      {!isCollapsed && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 60,
            width: 360,
            maxHeight: "85vh",
            overflowY: "auto",
            background: "rgba(17, 17, 17, 0.95)",
            backdropFilter: "blur(10px)",
            color: "#fff",
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
            zIndex: 9999,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            transition: "all 0.3s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
              paddingBottom: "12px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <span style={{ fontSize: "20px" }}>🌿</span>
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: "500",
                color: "#fff",
              }}
            >
              Bonsai Dev Panel
            </h3>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* State Tree Section */}
            <div>
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.7)",
                  fontWeight: "500",
                }}
              >
                State Tree
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    marginBottom: "12px",
                  }}
                >
                  <input
                    placeholder="Search state paths..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{
                      width: "85%",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      fontSize: "13px",
                      padding: "8px 12px",
                      paddingLeft: "32px",
                      borderRadius: "6px",
                      fontFamily: "inherit",
                      transition: "all 0.2s ease",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(255, 255, 255, 0.5)",
                      fontSize: "14px",
                    }}
                  >
                    🔍
                  </span>
                </div>
                {Object.entries(tree).length > 0 ? (
                  Object.entries(tree)
                    .filter(([path]) =>
                      path.toLowerCase().includes(filter.toLowerCase())
                    )
                    .map(([path, value]) => (
                      <div
                        key={path}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          padding: "8px",
                          background:
                            selectedPath === path
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(255, 255, 255, 0.03)",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onClick={() =>
                          setSelectedPath(path === selectedPath ? null : path)
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "12px",
                              color: "rgba(255, 255, 255, 0.7)",
                              fontWeight: "500",
                              letterSpacing: "0.3px",
                              flex: "1",
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {path}
                          </label>
                          {renderValueEditor(path, value)}
                        </div>
                        {selectedPath === path && (
                          <div
                            style={{
                              marginTop: "8px",
                              padding: "8px",
                              background: "rgba(0, 0, 0, 0.2)",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontFamily: "monospace",
                            }}
                          >
                            <div style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                              Type: {typeof value}
                            </div>
                            {typeof value === "object" && (
                              <div
                                style={{
                                  marginTop: "4px",
                                  color: "rgba(255, 255, 255, 0.7)",
                                }}
                              >
                                {JSON.stringify(value, null, 2)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div
                    style={{
                      color: "rgba(255, 255, 255, 0.5)",
                      fontSize: "13px",
                      padding: "8px 0",
                    }}
                  >
                    {filter
                      ? "No matching paths found..."
                      : "No state paths available yet..."}
                  </div>
                )}
              </div>
            </div>

            {/* Logs Section */}
            <div>
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.7)",
                  fontWeight: "500",
                }}
              >
                Logs
              </h4>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.2)",
                  borderRadius: "6px",
                  padding: "12px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  lineHeight: "1.5",
                }}
              >
                {logs.length ? (
                  logs.map((log, i) => (
                    <div
                      key={i}
                      style={{
                        color: "rgba(255, 255, 255, 0.8)",
                        marginBottom: "4px",
                      }}
                    >
                      {log}
                    </div>
                  ))
                ) : (
                  <div style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                    No logs yet...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
