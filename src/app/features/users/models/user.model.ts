export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joinedDate: Date;
  lastActive?: Date;
}
