import { User } from './User';
import { ShiftAssignment } from './ShiftAssignment';
export declare class Shift {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    date: string;
    description: string;
    requiredStaff: number;
    createdBy: User;
    createdById: string;
    assignments: ShiftAssignment[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=Shift.d.ts.map