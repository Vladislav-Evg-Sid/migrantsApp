export enum Month {
  Январь = 1,
  Февраль,
  Март,
  Апрель,
  Май,
  Июнь,
  Июль,
  Август,
  Сентябрь,
  Октябрь,
  Ноябрь,
  Декабрь,
}

export interface DateId {
  id: number;
  day: number;
}

export type ExamDate = Map<number, Map<Month, DateId[]>>;
