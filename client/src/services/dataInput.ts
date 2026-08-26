export function updateTextFieldValue(value: string, type: string): string {
  if (typeof type === "string") {
    if (type === "number") {
      if (!/^\d*$/.test(value)) {
        throw new Error("invalid number value");
      }
    }
    if (type === "phone" && !/^\d{0,11}$/.test(value)) {
      throw new Error("invalud phone value");
    }
  }
  return value;
}
