export interface TourStatsBucket {
  toursCount: number;
  distance: number;
  driveTime: string;
  workTime: string;
  daysOnDuty: number;
  daysOffDuty: number;
  totalRefuel: number;
  burnedFuelComp: number;
  burnedFuelReal: number;
  numberOfLoads: number;
  avgWeight: number;
  expectedSalary: number;
  salary: number;
  outgoings: number;
}

export interface TourStatsMonth extends TourStatsBucket {
  month: number;
}

export interface TourStatsYear extends TourStatsBucket {
  year: number;
  months: TourStatsMonth[];
}

export interface TourStatsInterface {
  currency: string;
  total: TourStatsBucket;
  years: TourStatsYear[];
}
