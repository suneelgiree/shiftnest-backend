import { Room } from './Room';
import { RoomBooking } from './RoomBooking';
import { SavedRoom } from './SavedRoom';
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    rooms: Room[];
    roomBookings: RoomBooking[];
    savedRooms: SavedRoom[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=User.d.ts.map