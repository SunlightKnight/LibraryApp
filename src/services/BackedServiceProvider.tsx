import { createContext } from "react";
import { throwError } from "./BackendError";
import { useTranslation } from "react-i18next";
import * as AppConfig from '../config/config';
import BackendServiceInterface from "./BackendServiceInterface";
import { OpenLibraryResponse } from "./models/OpenLibraryResponse";
import { login } from "./models/Login";
import { useAuth } from "./AuthContext";
import storage from "./StorageService";


// Default timeout: after FETCH_TIMEOUT * 1000 (see line 278) the promise is automatically rejected.
const FETCH_TIMEOUT = 60;


// APIs TEST endpoint, defined in "config.ts" file.
const API_BASE_URL: string = AppConfig.API_ENDPOINT;
const JSONBIN_API_KEY = "$2a$10$AAesUqIfMrjJUHxJuMX0IOQAwsnmQx.3FwQwJBNKtDLYvwEy0g6Hi";
const JSONBIN_BASE_URL = "https://api.jsonbin.io/v3";
const JSONBIN_COLLECTION_ID = "67ac5412acd3cb34a8decda8";
let lastUserId = 0;

export interface IJSON {
  [key: string]: any; 
}

/** Request methods. For more info: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods */
enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/** Response types. For more info: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types */
enum HTTPContentType {
  none = '',
  json = 'application/json',
  image = 'application/png',
  jpeg = 'image/jpeg',
  pdf = 'application/pdf',
}

/**
 * BackendServiceContext type.
 * 
 * @function setAuthToken - Saves the token object inside the context.
 * @function saveAthToken - Save the token object in the Keychain.
 * @function hasToken - Checks if token is present in context.
 * @function removeAuthToken - Deletes token object from Keychain.
 * @var beService - Object that contains all API call methods.
 */
interface BackendServiceContextType {
  beService: BackendServiceInterface
}

// Context object creation. In conjunction with "useContext" hook, it allows to use all
// BackendServiceProvider functionalities.
export const BackendServiceContext = createContext<BackendServiceContextType | null>(null);

/**
 * Component that handles API calls.
 * 
 * @param children - Components tree wrapped by BackendServiceProvider.
 * @returns BackendServiceProvider component with exposed functionalities.
 */
const BackendServiceProvider = ({ children } : any) => {
  const { t } = useTranslation();
  const {authState} = useAuth()
  /**
   * Function to save data to JSONBin.
   */
  const saveToJSONBin = async (data: IJSON) => {
    try {
      const response = await fetch(`${JSONBIN_BASE_URL}/b`, {
        method: HTTPMethod.POST,
        headers: {
          "Content-Type": HTTPContentType.json,
          "X-Master-Key": JSONBIN_API_KEY,
          "X-Collection-Id": JSONBIN_COLLECTION_ID,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save data to JSONBin");
      }
      return await response.json();
    } catch (error) {
      throwError({ status: 500, message: "Errore nel salvataggio", messageKey: "jsonbin_save_error" });
    }
  };

  /**
   * Function to retrieve all data from JSONBin.
   */
  const getFromJSONBin = async (): Promise<IJSON[]> => {
    try {
      const response = await fetch(`${JSONBIN_BASE_URL}/c/${JSONBIN_COLLECTION_ID}/bins`, {
        method: HTTPMethod.GET,
        headers: {
          "X-Master-Key": JSONBIN_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to retrieve data from JSONBin");
      }
      const data = await response.json();
      console.log("=================getFromJSONBin=================")
      data.forEach((element: { id: string }) => {
        console.log(element);
      });
      console.log("=================getFromJSONBin=================")
      // data.records è un array di oggetti, ciascuno con la proprietà "record" che contiene l'utente.
      return data;
    } catch (error) {
      throwError({ status: 500, message: t("errors.jsonbin_fetch_error"), messageKey: "jsonbin_fetch_error" });
      return [];
    }
  };

  /**
   * Function to fetch a single user by JSONBin bin ID.
   */

  const getUserById = async (id: string): Promise<login | undefined> => {
    try {
      const response = await fetch(`${JSONBIN_BASE_URL}/b/${id}`, {
        method: HTTPMethod.GET,
        headers: {
          "X-Master-Key": JSONBIN_API_KEY,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to retrieve user by id");
      }
      const data = await response.json();
      console.log("getUserById -> " + data.record.username)
      // I dati interessanti sono nella proprietà "record"
      return data.record;
    } catch (error) {
      throwError({ status: 500, message: t("errors.jsonbin_fetch_error"), messageKey: "jsonbin_fetch_error" });
    }
  };

  /**
   * Function that handles the result of manageResponse.
   */
  const callJSON = async (
    url: string,
    method: HTTPMethod,
    payload: IJSON | undefined,
    responseContentType: HTTPContentType,
  ): Promise<any> => {
    try {
      var headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
        'User-Agent' : 'LibraryApp/1.0 (samuele.tonelli@pmpayment.com)',
        'Accept': responseContentType,
      };

      const opts = {
        method: method,
        headers: headers,
        body: JSON.stringify(payload),
      };
      console.log(
        `*** BackendService:callJSON: fetching .../${url} with opts=${JSON.stringify(opts)}`,
      );

      const response = await fetchWithTimeout(url, opts);

      return await manageResponse(response, responseContentType).catch(async (error: any) => {
        throw error;
      });
    } catch (error: any) {
      console.log(
        '*** BackendService:callJSON:' + url + ': got error => ',
        error.message || "empty error message"
      );
      if (error && error.message && error.message !== "Failed to fetch") {
        throwError({status: error.status || 500, message: error.message, messageKey: error.messageKey || "generic"})
      } else {
        throwError({status: error.status || 500, message: t("errors.generic"), messageKey: "fetch"})
      }
    }
  };

  /**
   * Manages API response.
   */
  const manageResponse = async (
    response: Response,
    responseContentType: HTTPContentType,
  ): Promise<any> => {
    console.log("*** BackendService - Response -> ", response);
    try {
      if (!response.ok) { // Gestisce tutti gli status non 2xx
        if (response.status === 401) {
          throwError({ status: 401, message: t("errors.unauthorized"), messageKey: "unauthorized" });
        } else {
          const errorData = await response.json();
          throwError({ status: response.status, message: errorData.error || t("errors.generic"), messageKey: "generic" });
        }
      }

      if (response.status === 200 || response.status === 201 || response.status === 204) {
        if (responseContentType === HTTPContentType.none) {
          return;
        }
        let contentType = response.headers.get('Content-Type');

        if (contentType !== null) {
          contentType = contentType.split(';')[0]; // ignore things like "...;charset=..."
        }
        if (contentType !== responseContentType) {
          throwError({
            status: 415,
            message: `Bad content type <${contentType}>`,
            messageKey: 'bad_content_type',
          });
        }
        switch (contentType) {
          case HTTPContentType.json:
            const json = await response.json();
            return json;
          case HTTPContentType.image:
          case HTTPContentType.jpeg:
            const image = await response.text();
            console.log(`*** BackendService:manageResponse: got image for ${response.url} => ${image.length} bytes`);
            return image;
          case HTTPContentType.pdf:
            const pdf = await response.text();
            console.log(`*** BackendService:manageResponse: got pdf for ${response.url} => ${pdf.length} bytes`);
            return pdf;
          default:
            throwError({
              status: 415,
              message: `Invalid content type <${contentType}>`,
              messageKey: 'invalid_content_type',
            });
        }
      } 
    } catch (error: any) {
      if (error == 401) {
        throw error;
      } else {
        console.log('*** BackendService:manageResponse: ' + response.url + ': got error => ', error.message);
        throw error;
      }
    }
  };

  /**
   * Function that handles the actual API call.
   */
  const fetchWithTimeout = async (
    url: string,
    options: RequestInit,
    timeout: number = FETCH_TIMEOUT,
  ): Promise<any> => {
    const headers = (options.headers || {}) as any;
    headers['Request-Timeout'] = timeout;
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject({status: 408, message: t("errors.timeout"), messageKey: 'timeout'}), timeout * 1000)
      ),
    ]);
  };

  const getBookList = (query: string, page: number = 1): Promise<OpenLibraryResponse> => {
    return callJSON(
      API_BASE_URL + `/search.json?q=${query}&fields=*,availability&page=${page}&limit=50`,
      HTTPMethod.GET,
      undefined,
      HTTPContentType.json
    );
  };

  const getTwentyBooks = (): Promise<OpenLibraryResponse> => {
    return callJSON(
      API_BASE_URL + `/search.json?q=a&sort=rating&sort=random.hourly&fields=*,availability&language=eng&limit=20`,
      HTTPMethod.GET,
      undefined,
      HTTPContentType.json
    );
  };

  const getBookWithPrefix = (prefix : string, suffix : string) : Promise<OpenLibraryResponse> => {
    return callJSON(
      API_BASE_URL + `/search.json?${prefix}=${suffix}&fields=*,availability&limit=5`,
      HTTPMethod.GET,
      undefined,
      HTTPContentType.json
    );
  };

  const getBookWithPrefixExtended = (prefix : string, suffix : string, page : number, limit: number) : Promise<OpenLibraryResponse> => {
    return callJSON(
      API_BASE_URL + `/search.json?${prefix}=${suffix}&fields=*,availability&page=${page}&limit=${limit}`,
      HTTPMethod.GET,
      undefined,
      HTTPContentType.json
    );
  };

  const getBookFromAuthorAndTitle = (title: string, author : string): Promise<OpenLibraryResponse> => {
    return callJSON(
      API_BASE_URL + `/search.json?q=${title}+${author}&fields=*,availability&limit=1`,
      HTTPMethod.GET,
      undefined,
      HTTPContentType.json
    );
  };

  /**
   * Registra un utente su JSONBin.
   * Salva i dati e memorizza lastUserId per evitare ricerche ripetute.
   */

  const registerUser = async (user: login): Promise<any> => {
    let existingUser
    try {
      const result = await getFromJSONBin();
      const users = await Promise.all(
        result.map((element) => getUserById(element.record))
      );
       existingUser = users.find(
        (existing) =>
          existing?.username === user.username || existing?.email === user.email
      );
  
      if (existingUser) {
        throwError({
          status: 500,
          message: t("Nome utente o email gia registrati"),
          messageKey: "already_registered",
        });
      }
      const savedUser = await saveToJSONBin(user);
      console.log("User registered successfully:", savedUser);
      lastUserId = savedUser.metadata.id;
      return savedUser.record;
    } catch (error) {
      if(existingUser){
        console.error("Error registering user:", error);
        throwError({
          status: 400,
          message: t("errors.already_registered"),
          messageKey: "already_registered",
        });
      }
      console.error("Error registering user:", error);
      throwError({
        status: 500,
        message: t("errors.register_failed"),
        messageKey: "register_failed",
      });
    }
  };
  /**
   * Effettua il login cercando l'utente su JSONBin.
   * Se lastUserId è presente, viene usato per fare il fetch diretto; altrimenti, si cercano tutti i record.
   */
  const loginUser = async (username: string, password: string): Promise<any> => {
    try {
      let user: login | undefined;
      if (lastUserId) {
        const lastRegisteredUser = await getUserById(String(lastUserId));
        if (lastRegisteredUser && lastRegisteredUser.username === username) {
          user = lastRegisteredUser;
        }
      }
      if (!user) {
        const data = await getFromJSONBin();
        for (const element of data) {
          const response = await getUserById(element.record);
          console.log(element.record)
          if (response?.username === username) {
            user = response
            lastUserId = element.record
            break;
          }
        }
      }
      if (!user || user.password !== password) {
        throwError({ status: 401, message: t("errors.invalid_credentials"), messageKey: "invalid_credentials" });
      }
      console.log("User logged in successfully:", user);
      return user;
    } catch (error) {
      console.error("Error logging in:", error);
      throwError({ status: 500, message: t("errors.login_failed"), messageKey: "login_failed" });
    }
  };

  const updateUser = async (user : login): Promise<any> => {
    if (!authState?.user || !lastUserId) {
      console.error("Invalid user state or lastUserId is not set.");
      throwError({
        status: 400,
        message: t("errors.invalid_user_state"),
        messageKey: "invalid_user_state",
      });
    }
  
    try {
      const url = `${JSONBIN_BASE_URL}/b/${lastUserId}`;
      const response = await fetch(url, {
        method: HTTPMethod.PUT,
        headers: {
          "Content-Type": HTTPContentType.json,
          "X-Master-Key": JSONBIN_API_KEY,
        },
        body: JSON.stringify(user),
      });
  
      console.log("User updated successfully:", response);
      getFromJSONBin()
      return response;
    } catch (error) {
      console.error("Error updating user:", error);
      throwError({
        status: 500,
        message: t("errors.updatingUser_failed"),
        messageKey: "updatingUser_failed",
      });
    }
  };
  

  return <BackendServiceContext.Provider value={{
    beService: {
      getBookList: getBookList,
      getTwentyBooks: getTwentyBooks,
      getBookWithPrefix: getBookWithPrefix,
      getBookWithPrefixExtended: getBookWithPrefixExtended,
      getBookFromAuthorAndTitle: getBookFromAuthorAndTitle,
      registerUser: registerUser,
      loginUser: loginUser,
      updateUser : updateUser
    }
  }}>
    {children}
  </BackendServiceContext.Provider>;
};

export default BackendServiceProvider;
