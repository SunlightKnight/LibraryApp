import { createContext } from "react";
import { throwError } from "./BackendError";
import { useTranslation } from "react-i18next";
import * as AppConfig from '../config/config';
import BackendServiceInterface from "./BackendServiceInterface";

// Default timeout: after FETCH_TIMEOUT * 1000 (see line 278) the promise is automatically rejected.
const FETCH_TIMEOUT = 30
// APIs TEST enpoint, defined in "config.ts" file.
const API_BASE_URL: string = AppConfig.API_ENDPOINT

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
  pdf = 'application/pdf',
}

/**
 * BackendServiceContext type.
 * 
 * @function setAuthToken - Saves the token object inside the context (see line 81).
 * @function saveAthToken - Save the token object in the Keychain (see line 314).
 * @function hasToken - Checks if token is present in context (see line 86).
 * @function removeAuthToken - Deletes token object from Keychain (see line 322).
 * @var beService - Object that contains all API call methods.
 */
interface BackendServiceContextType {
  beService: BackendServiceInterface
}

// Context object creation. In conjunction with "useContext" hook, it allows to use all
// BackendServiceProvider functionalities. For more info:
// https://react.dev/reference/react/useContext
export const BackendServiceContext = createContext<BackendServiceContextType | null>(null)

/**
 * Component that handles API calls.
 * 
 * @param children - Components tree wrapped by BackendServiceProvider. 
 * @returns BackendServiceProvider component with exposed functionalities.
 */
const BackendServiceProvider = ({ children } : any) => {
  const { t } = useTranslation()

  /**
   * Function that handles the result of manageResponse.
   * 
   * @param url - API endpoint url.
   * @param method - HTTP method to use.
   * @param payload - Possible HTTP call payload (ex. in POST request).
   * @param responseContentType - Response type.
   * @param retry - Value that determines if the current call is to be tried again or not, default is true.
   * @returns A promise containing the data requested or an error.
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
        'Accept': responseContentType,
      };

      const opts = {
        method: method,
        headers: headers,
        body: JSON.stringify(payload),
      };
      console.log(
        `*** BackendService:callJSON: fetching .../${url} with opts=${JSON.stringify(
          opts,
        )}`,
      );

      const response = await fetchWithTimeout(url, opts);

      return await manageResponse(
        response,
        responseContentType,
      ).catch(async (error: any) => {
        throw error;
      });
    } catch (error: any) {
      console.log(
        '*** BackendService:callJSON:' + url + ': got error => ',
        error.message || "empty error message"
      );
      if (error && error.message && error.message !== "Failed to fetch") {
        throwError({status: error.status || 500, message: error.message, messageKey: error.messageKey})
      } else {
        throwError({status: error.status || 500, message: t("errors.generic"), messageKey: "error.fetch"})
      }
    }
  }

  /**
   * Manages API response.
   * 
   * @param response - API full response.
   * @param responseContentType - Response type.
   * @returns A promise containing the data requested or an error.
   */
  const manageResponse = async (
    response: Response,
    responseContentType: HTTPContentType,
  ): Promise<any> => {
    console.log("*** BackendService - Response -> ", response)
    try {
      if (response.status !== 200) {
        if (response.status === 401) {
          throwError({
            status: 401,
            message: t("errors.unathorized"),
            messageKey: "error.unauthorize"
          })
        } else {
          throwError({
            status: response.status,
            message: t("errors.generic"),
            messageKey: "error.generic"
          })
        }
      }

      if (response.status === 201 || response.status === 200 || response.status === 204) {
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
          })
        }
        switch (contentType) {
          case HTTPContentType.json:
            const json = await response.json();
            console.log(
              `*** BackendService:manageResponse: got json for ${response.url} => ${JSON.stringify(json)}`,
            );
            return json;
          case HTTPContentType.image:
            const image = await response.text();
            // TODO: is <image> encoded in some way?
            console.log(
              `*** BackendService:manageResponse: got image for ${response.url} => ${image.length} bytes`,
            );
            return image;
          case HTTPContentType.pdf:
            const pdf = await response.text();
            // TODO: is <pdf> encoded in some way?
            console.log(
              `*** BackendService:manageResponse: got pdf for ${response.url} => ${pdf.length} bytes`,
            );
            return pdf;
          default:
            throwError({
              status: 415,
              message: `Invalid content type <${contentType}>`,
              messageKey: 'invalid_content_type',
            })
        }
      } 
    } catch (error: any) {
      if (error == 401) {
        throw error;
      } else {
        console.log(
          '*** BackendService:manageResponse: ' +
            response.url +
            ': got error => ',
          error.message,
        );
        throw error
      }
    }
  }

  /**
   * Function that handles the actual API call.
   * 
   * @param url - API resource url (API_BASE_URL + resource endpoint).
   * @param options - Options object (see line 82).
   * @param timeout - Request timeout.
   * @returns A promise containing the data requested or an error.
   */
  const fetchWithTimeout = async (
    url: string,
    options: RequestInit,
    timeout: number = FETCH_TIMEOUT,
  ): Promise<any> => {
    const headers = (options.headers || {}) as any;
    headers['Request-Timeout'] = timeout;
    // For more info on promise - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(
          () => reject({status: 408, message: t("errors.timeout"), messageKey: 'timeout'}),
          timeout * 1000,
        ),
      ),
    ]);
  }

  // const getEventList = (): Promise<EventsListResponseDTO> => {
  //   return callJSON(
  //     API_BASE_URL + `/eventi`,
  //     HTTPMethod.GET,
  //     undefined,
  //     HTTPContentType.json
  //   )
  // } 

  return <BackendServiceContext.Provider value={{
    beService: {}
  }}>
    {children}
  </BackendServiceContext.Provider>
}

export default BackendServiceProvider