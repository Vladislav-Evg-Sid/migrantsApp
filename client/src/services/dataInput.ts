export function updateTextFieldValue(value: string, type: string): string {
  if (type === "number") {
    if (!/^\d*$/.test(value)) {
      throw new Error("invalid number value");
    }
  }
  if (type === "phone" && !/^\d{0,11}$/.test(value)) {
    throw new Error("invalud phone value");
  }
  return value;
}

export function parseExamResult(rawResult: string): 1 | 2 | 3 | null {
  switch (rawResult) {
    case "1":
      return 1;
    case "2":
      return 2;
    case "3":
      return 3;
  }
  return null;
}
