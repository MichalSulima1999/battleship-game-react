export default interface Ship {
  id: number;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
  isDragging: boolean;
  isDestroyed: boolean;
  isSelected: boolean;
}
