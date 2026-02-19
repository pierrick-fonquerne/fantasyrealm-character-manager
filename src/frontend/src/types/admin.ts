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

export interface ActivityLog {
  id: string;
  action: string;
  actorId: number;
  actorPseudo: string;
  targetType: string;
  targetId: number;
  targetName: string | null;
  details: string | null;
  timestamp: string;
}

export type ActivityAction =
  | 'CharacterApproved'
  | 'CharacterRejected'
  | 'CommentApproved'
  | 'CommentRejected'
  | 'ArticleCreated'
  | 'ArticleUpdated'
  | 'ArticleDeleted'
  | 'UserSuspended'
  | 'UserReactivated'
  | 'UserDeleted'
  | 'EmployeeCreated'
  | 'EmployeeSuspended'
  | 'EmployeeReactivated'
  | 'EmployeeDeleted'
  | 'PasswordChanged';
