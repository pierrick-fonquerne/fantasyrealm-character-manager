export interface AdminStats {
  totalUsers: number;
  suspendedUsers: number;
  totalEmployees: number;
  totalCharacters: number;
  pendingCharacters: number;
  totalComments: number;
  pendingComments: number;
}

export interface EmployeeManagement {
  id: number;
  pseudo: string;
  email: string;
  isSuspended: boolean;
  createdAt: string;
}
