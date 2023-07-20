export const uniqueId = (suffix: string = ""): string => {
  return `${suffix ? suffix + "-" : ""}${Date.now()}-${Math.random()
    .toString(36)
    .substring(0, 9)}`;
};
