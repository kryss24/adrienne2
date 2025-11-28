export type UserRole = 'student' | 'admin' | 'superadmin';

export type RequestStatus = 'pending' | 'in_progress' | 'validated' | 'rejected' | 'transmitted';

export type RequestType = 'note_manquante' | 'erreur_saisie' | 'incoherence' | 'autre';

export interface User {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  classId?: string;
  email?: string;
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  adminId: string;
  studentCount: number;
}

export interface Request {
  id: string;
  studentId: string;
  studentName: string;
  studentMatricule: string;
  classId: string;
  className: string;
  subject: string;
  type: RequestType;
  description: string;
  status: RequestStatus;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  processedBy?: string;
  processedAt?: string;
  rejectionReason?: string;
}

export interface Notification {
  id: string;
  userId: string;
  requestId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface RequestFormData {
  subject: string;
  type: RequestType;
  description: string;
  attachments: File[];
}

export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  validated: number;
  rejected: number;
  transmitted: number;
  avgProcessingTime: number;
}
