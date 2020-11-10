export interface Task {
  id: number;
  title: string;
  description: string;
  contactId?: number;
  duration?: number;
  startDate?: Date;
}
