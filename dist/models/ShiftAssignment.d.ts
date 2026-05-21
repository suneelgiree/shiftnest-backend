import { User } from './User';
import { Shift } from './Shift';
export declare class ShiftAssignment {
    id: string;
    user: User;
    userId: string;
    shift: Shift;
    shiftId: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=ShiftAssignment.d.ts.map