export interface OrnaCalendarEvent {
  id: string;
  name: string;
  startDay: number;
  endDay: number;
  icon: string;
  color: string;
  tag: string;
  descriptionEs: string;
  descriptionEn: string;
  rewardsEs: string;
  rewardsEn: string;
}

export interface CalendarCell {
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: OrnaCalendarEvent[];
}
