import { IJSON } from "./BackedServiceProvider"
import { login } from "./models/Login"
import { OpenLibraryResponse } from "./models/OpenLibraryResponse"

// BackendServiceProvider MUST implement all the functions defined inside its interface.
export default interface BackendServiceInterface {
    getBookList : (query : string, page : number) => Promise<OpenLibraryResponse>
    getTwentyBooks : () => Promise<OpenLibraryResponse>
    getBookWithPrefix : (prefix : string, suffix : string) => Promise<OpenLibraryResponse>
    getBookWithPrefixExtended : (prefix : string, suffix : string, page : number, limit:number) => Promise<OpenLibraryResponse>
    getBookFromAuthorAndTitle : (title: string, author : string) => Promise<OpenLibraryResponse>
    registerUser : (user:login) => Promise<login>
    loginUser : (username : string, password : string) => Promise<login>
    updateUser : (user : login) => Promise<login>
} 