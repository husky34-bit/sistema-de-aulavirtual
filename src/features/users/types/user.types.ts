export interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  enrollmentCount: number;
}
