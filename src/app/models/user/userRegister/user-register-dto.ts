import { UserCredentialDTO } from "../user-credential-dto"

export interface UserRegisterDTO {
    name:string
    lastname:string
    nickname:string
    credential:UserCredentialDTO
}
