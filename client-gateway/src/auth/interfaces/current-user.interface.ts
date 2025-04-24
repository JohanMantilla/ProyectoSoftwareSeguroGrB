import { Role } from "../enum/roles.enum";

export interface CurrentUser{
    id: string;
    roles?: string[];
}