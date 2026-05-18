export type TicketStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  date: string;
  status: TicketStatus;
  type?: string;
  topic?: string;
  attachments?: File[];
  priority?: 'Low' | 'Medium' | 'High';
  assignee?: string;
}
