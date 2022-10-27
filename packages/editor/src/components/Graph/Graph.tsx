import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { data } from "./data";
import G6 from "@antv/g6";
import forwardIcon from "./forwardIcon.svg";
import conditionArrows from "./conditionArrows.svg";

const Graph = () => {
  const ref = React.useRef(null);
  let graph: any = null;
  // Instantiate the Minimap
  const minimap = new G6.Minimap({
    size: [100, 100],
    className: "minimap",
    type: "delegate",
  });

  G6.registerNode(
    "node-start",
    (cfg) => `
    <group>
      <rect style={{
        width: 272, height: 61, fill: '#F9FAFC', radius: [6, 6, 0, 0]
      }} keyshape="true" name="test">
        <rect style={{
          width: 4, height: 13, fill: '#00CC99', radius: 2, marginTop: 6, marginLeft: 6
        }} ></rect>

        
        <text style={{
          marginLeft: -13,
          marginTop: 4,
          fill: '#8D96B5'
        }}>
          ${cfg.priority}
        </text>
        <text style={{
          marginLeft: 50,
          marginTop: -26,
          fill: '#000000E5' }} 
          name="title">${cfg.label}</text>
        
        <Image
          style={{
            img: ${forwardIcon},
            width: 18,
            height: 13.91,
            marginTop: -38,
            marginLeft: 240,
          }}
        />

        <text style={{
          marginLeft: 6,
          marginTop: -20,
          fill: '#8D96B5' }} >Sample text</text>
        <rect style={{
          width: 272, height: 2, fill: '#3300FF1A', marginTop: -15
        }} ></rect>
      </rect>
    </group>
  `
  );

  G6.registerNode(
    "node-response",
    (cfg) => `
    <group>
      <rect style={{
        width: 272, height: 61, fill: '#F9FAFC', radius: [6, 6, 0, 0],
      }} keyshape="true" name="test">
        <rect style={{
          width: 4, height: 13, fill: '#3399CC', radius: 2, marginTop: 6, marginLeft: 6
        }} ></rect>
        
        
        <text style={{
          marginLeft: -13,
          marginTop: 4,
          fill: '#8D96B5'
        }}>
          ${cfg.priority}
        </text>
        <text style={{
          marginLeft: 50,
          marginTop: -26,
          fill: '#000000E5' }} 
          name="title">${cfg.label}</text>
        
        <Image
          style={{
            img: ${forwardIcon},
            width: 18,
            height: 13.91,
            marginTop: -38,
            marginLeft: 240,
          }}
        />
        
        <text style={{
          marginLeft: 6,
          marginTop: -20,
          fill: '#8D96B5' }} >Sample text</text>
        <rect style={{
          width: 272, height: 2, fill: '#3300FF1A', marginTop: -15
        }} ></rect>
      </rect>
    </group>
  `
  );

  G6.registerNode(
    "node-condition",
    (cfg) => `
    <group>
      <rect style={{
        width: 272, height: 25, fill: '#F9FAFC', radius: 6
      }} keyshape="true" name="test">
        <rect style={{
          width: 4, height: 13, fill: '#FF9500', radius: 2, marginTop: 6, marginLeft: 6
        }} ></rect>

        
        <text style={{
          marginLeft: -13,
          marginTop: 4,
          fill: '#8D96B5'
        }}>
          ${cfg.priority}
        </text>
        <text style={{
          marginLeft: 50,
          marginTop: -26,
          fill: '#000000E5' }} 
          name="title">${cfg.label}</text>

        <Image
          style={{
            img: ${conditionArrows},
            marginTop: -38,
            marginLeft: 240,
          }}
        />
      </rect>
    </group>
  `
  );

  // Instantiate grid
  const grid = new G6.Grid();

  useEffect(() => {
    if (!graph) {
      graph = new G6.Graph({
        container: ReactDOM.findDOMNode(ref.current) as HTMLElement,
        width: 1200,
        height: 800,
        modes: {
          default: ["drag-canvas", "drag-node"],
        },
        plugins: [minimap],
        layout: {
          type: "dagre",
          direction: "LR",
        },
        defaultNode: {
          type: "rect-xml",
          // size: [120, 40],
        },
        defaultEdge: {
          type: "cubic-horizontal",
          style: {
            stroke: "#CED4D9",
          },
        },
      });
    }

    graph.data(data);
    graph.render();
  }, []);

  return <div ref={ref}></div>;
};

export default Graph;
