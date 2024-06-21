/**
 * Represents fetch interceptor to json api. May be used to add additional behaviours
 * to the fetch api call, such as mocking.
 * 
 * @type {JsonApiFetchInterceptor}
 */
export type JsonApiFetchInterceptor = (request: Request) => Promise<Response>;
