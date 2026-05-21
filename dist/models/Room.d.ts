import { User } from './User';
import { RoomFacility } from './RoomFacility';
import { RoomImage } from './RoomImage';
import { RoomBooking } from './RoomBooking';
import { SavedRoom } from './SavedRoom';
export declare class Room {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
    roomType: string;
    bedrooms: number;
    bathrooms: number;
    isVerified: boolean;
    isActive: boolean;
    owner: User;
    ownerId: string;
    facilities: RoomFacility[];
    images: RoomImage[];
    bookings: RoomBooking[];
    savedBy: SavedRoom[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=Room.d.ts.map