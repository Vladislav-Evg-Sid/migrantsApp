import type { ReactNode } from "react";

export function tableColumnHider(
  index: number,
  hideIdCol: boolean,
  cell: ReactNode,
): ReactNode {
  if (hideIdCol && index === 0) {
    return <></>;
  }
  return cell;
}
