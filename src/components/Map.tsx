import { KonvaEventObject } from "konva/lib/Node";
import React, { useEffect, useState } from "react";
import { Group, Image, Layer, Line, Stage } from "react-konva";
import { JsxAttribute } from "typescript";
import useImage from "use-image";
import Ship from "../interfaces/Ship";

const SCENE_BASE_WIDTH = 800;
const SCENE_BASE_HEIGHT = 800;

const Map = () => {
  const [gridWidth, setGridWidth] = useState(800);
  const [gridHeight, setGridHeight] = useState(800);
  const [grid, setGrid] = useState(35);
  const [linesA, setLinesA] = useState<JSX.Element[]>([]);
  const [linesB, setLinesB] = useState<JSX.Element[]>([]);
  const [selectedTable, setSelectedTable] = useState(-1);
  const [doubleClicked, setDoubleClicked] = useState(false);

  const [ships, setShips] = useState<Ship[]>([]);

  const [image] = useImage("ship.png");

  const [size, setSize] = useState({
    width: window.innerWidth * 0.8,
    height: window.innerHeight * 0.8,
  });

  useEffect(() => {
    const checkSize = () => {
      setSize({
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.8,
      });
    };

    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // do your calculations for stage properties
  const scale = size.width / SCENE_BASE_WIDTH;

  useEffect(() => {
    const lines1 = [];
    const lines2 = [];

    for (let i = 0; i < 11; i++) {
      lines1.push(
        <Line
          x={grid * i}
          y={0}
          strokeWidth={1}
          stroke={"black"}
          points={[0, 0, 0, grid * 10]}
        />
      );
    }

    setLinesA(lines1.map((el) => el));

    for (let i = 0; i < 11; i++) {
      lines2.push(
        <Line
          x={0}
          y={grid * i}
          strokeWidth={1}
          stroke={"black"}
          points={[grid * 10, 0, 0, 0]}
        />
      );
    }

    setLinesB(lines2.map((el) => el));

    createShips();
  }, []);

  const createShips = () => {
    const ships: Ship[] = [];

    let id = 0;
    for (let i = 1; i < 5; i++) {
      for (let j = i; j < 5; j++) {
        const ship: Ship = {
          id: id,
          x: id * grid,
          y: grid,
          sizeX: 1,
          sizeY: i,
          isDragging: false,
          isDestroyed: false,
          isSelected: false,
        };

        ships.push(ship);
        id++;
      }
    }

    setShips(ships);
  };

  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {};

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    if (!ships) return;

    const draggedShip = ships.find((el) => {
      return el.id.toString() === e.target.id();
    });

    if (!draggedShip) return;

    const x = Math.round(e.target.x() / grid) * grid;
    const y = Math.round(e.target.y() / grid) * grid;

    const tableComesOver = ships.some(
      (el) =>
        x + draggedShip.sizeX * grid > el.x &&
        x < el.x + el.sizeX * grid &&
        y + draggedShip.sizeY * grid > el.y &&
        y < el.y + el.sizeY * grid &&
        el.id !== draggedShip.id
    );

    const tableBeyondGrid =
      x < 0 ||
      x > (10 - draggedShip.sizeX) * grid ||
      y < 0 ||
      y > (10 - draggedShip.sizeY) * grid;

    if (tableComesOver || tableBeyondGrid) {
      e.target.to({
        x: draggedShip.x,
        y: draggedShip.y,
      });
      return;
    }

    console.log(`x:${x} y:${y}`);
    console.log(ships);

    const id = e.target.id();
    e.target.to({
      x: x,
      y: y,
    });
    setShips(
      ships.map((ship) => {
        return {
          ...ship,
          isDragging: false,
          x:
            ship.id.toString() === id
              ? Math.round(e.target.x() / grid) * grid
              : ship.x,
          y:
            ship.id.toString() === id
              ? Math.round(e.target.y() / grid) * grid
              : ship.y,
        };
      })
    );
  };

  const handleSelect = (e: KonvaEventObject<MouseEvent>) => {};

  const handleRotation = (e: KonvaEventObject<MouseEvent>) => {
    if (doubleClicked) return;

    const shipIndex = ships.findIndex(
      (ship) => ship.id.toString() === e.target.id()
    );
    if (shipIndex < 0) {
      return;
    }

    const tableComesOver = ships.some(
      (el) =>
        ships[shipIndex].x + ships[shipIndex].sizeY * grid > el.x &&
        ships[shipIndex].x < el.x + el.sizeX * grid &&
        ships[shipIndex].y + ships[shipIndex].sizeX * grid > el.y &&
        ships[shipIndex].y < el.y + el.sizeY * grid &&
        el.id !== ships[shipIndex].id
    );

    const tableBeyondGrid =
      ships[shipIndex].x < 0 ||
      ships[shipIndex].x > (10 - ships[shipIndex].sizeY) * grid ||
      ships[shipIndex].y < 0 ||
      ships[shipIndex].y > (10 - ships[shipIndex].sizeX) * grid;

    if (tableComesOver || tableBeyondGrid) {
      return;
    }

    [ships[shipIndex].sizeX, ships[shipIndex].sizeY] = [
      ships[shipIndex].sizeY,
      ships[shipIndex].sizeX,
    ];

    setShips(
      ships.map((ship) => {
        return {
          ...ship,
        };
      })
    );

    setDoubleClicked(true);
    delay(250).then(() => setDoubleClicked(false));
  };

  function delay(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  return (
    <div>
      <Stage
        width={size.width}
        height={size.height}
        scaleX={scale}
        scaleY={scale}
        className="mb-3 bg-success rounded p-3 d-flex justify-content-center"
      >
        <Layer>
          {linesA}
          {linesB}
        </Layer>
        <Layer>
          {ships.map((ship) => (
            <Group
              name="group"
              key={ship.id}
              id={ship.id.toString()}
              x={ship.x}
              y={ship.y}
              draggable
              scaleX={ship.isDragging ? 1.05 : 1}
              scaleY={ship.isDragging ? 1.05 : 1}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              width={grid * ship.sizeX}
              height={grid * ship.sizeY}
            >
              <Image
                name="image"
                id={ship.id.toString()}
                onMouseDown={handleSelect}
                onDblClick={handleRotation}
                image={image}
                shadowColor={ship.isSelected ? "tomato" : "black"}
                shadowBlur={ship.isSelected ? 3 : 10}
                shadowOpacity={ship.isSelected ? 0.9 : 0.6}
                shadowOffsetX={ship.isDragging ? 10 : 5}
                shadowOffsetY={ship.isDragging ? 10 : 5}
                width={grid * ship.sizeX}
                height={grid * ship.sizeY}
                opacity={ship.isDestroyed ? 1 : 0.5}
              />
            </Group>
          ))}
        </Layer>
      </Stage>
      <button onClick={() => setGrid(50)}>dfg</button>
    </div>
  );
};

export default Map;
