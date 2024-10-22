import { UserInterface } from "./UserInterface";

export interface LoginResponse {
    user: UserInterface;
    accessToken: string;
}