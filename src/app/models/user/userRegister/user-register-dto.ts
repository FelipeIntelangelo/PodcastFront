import { UserCredentialDTO } from "../user-credential-dto"

export interface UserRegisterDTO {
    name: string;
    lastName: string; // Cambiado de lastname a lastName para coincidir con el backend
    nickname: string;
    credential: UserCredentialDTO;
}
