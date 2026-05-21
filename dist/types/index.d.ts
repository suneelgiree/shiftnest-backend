export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'admin' | 'manager' | 'employee';
    createdAt: Date;
    updatedAt: Date;
}
export interface Shift {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    date: Date;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ShiftAssignment {
    id: string;
    userId: string;
    shiftId: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}
export interface ApiErrorResponse {
    success: false;
    message: string;
    error?: any;
    timestamp: string;
}
export interface PaginationQuery {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
//# sourceMappingURL=index.d.ts.map