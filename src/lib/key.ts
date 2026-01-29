const pressedKeys = new Set();

window.addEventListener("keydown", (event) => pressedKeys.add(event.key));
window.addEventListener("keyup", (event) => pressedKeys.delete(event.key));

export function isKeyPressed(key: string) {
  return pressedKeys.has(key);
}
