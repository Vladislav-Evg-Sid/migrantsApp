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

export type ExamDate = Map<number, Map<Month, number[]>>;
