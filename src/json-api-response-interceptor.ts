/**
 * Represents response interceptor to json api. May be used to add additional behaviours
 * to a response.
 * 
 * @type {JsonApiResponseInterceptor}
 */
export type JsonApiResponseInterceptor = (response: Response) => Response;
