import React from "react";
import "./App.css";
import { initTreeState, set, useTreeBonsai } from "@bonsai-ts/state";
import { DevPanel } from "@bonsai-ts/state/devtools";

// Initialize Bonsai state
initTreeState({
  initialState: {
    user: {
      name: "John Doe",
      age: 30,
    },
  },
});

function App() {
  // Use Bonsai to get user name
  const userName = useTreeBonsai<string>("user/name") || "";

  // Function to update user name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    set("user/name", e.target.value);
  };

  return (
    <div className="App">
      <h1>Bonsai Test App</h1>
      <div>
        <label htmlFor="userName">User Name:</label>
        <input
          id="userName"
          type="text"
          value={userName}
          onChange={handleNameChange}
        />
      </div>
      <p>Current User Name: {userName}</p>
      <DevPanel />
    </div>
  );
}

export default App;
