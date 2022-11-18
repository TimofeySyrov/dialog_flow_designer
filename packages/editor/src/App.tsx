import Canvas from "./components/Canvas/Canvas";
import TopBar from "./components/TopBar/TopBar";
import { useEditorMessages } from "./store";

function App() {
  // Connect store to backend
  useEditorMessages();

  return (
    <div className="flex flex-col h-full">
      {/* <div className="ml-a p-2 p-t-5 p-b-5 w-70">
        {selectedNode && mode === Mode.ADD && (
          <Autocomplete
            previousProps={selectedNode.properties}
            turn={selectedNode.turn}
            onEnter={(newNode) => addNode(newNode, selectedNode.id)}
          />
        )}
      </div> */}
      <TopBar />
      <Canvas />

      {/* <Graph /> */}
    </div>
  );
}

export default App;
