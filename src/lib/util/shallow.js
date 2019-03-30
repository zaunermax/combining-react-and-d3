export const shallowCompare = (objects, newObjects) =>
  Object.keys(objects).some((key) => objects[key] !== newObjects[key])
