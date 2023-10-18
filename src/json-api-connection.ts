import fetch, { Headers, Request } from 'cross-fetch';
import { isEmpty, isObject, isString } from 'lodash';
import { ConflictJsonApiError } from './errors/conflict-json-api-error';
import { ForbiddenJsonApiError } from './errors/forbidden-json-api-error';
import { NotFoundJsonApiError } from './errors/not-found-json-api-error';
import { OtherJsonApiError } from './errors/other-json-api-error';
import { JsonApiRequestInterceptor } from './json-api-request-interceptor';
import { JsonApiResponseInterceptor } from './json-api-response-interceptor';
import { DocumentObject } from './types/document-object';
import { LinkObject } from './types/link-object';

/**
 * Represents a connection to json api.
 * 
 * @type {JsonApiConnection}
 */
export class JsonApiConnection 
{
    /**
     * Base url provided by developer.
     * 
     * @type {string}
     */
    public readonly baseUrl: string;

    /**
     * Json api request interceptor for adding additional behaviours.
     * 
     * @type {JsonApiRequestInterceptor}
     */
    public readonly jsonApiRequestInterceptor: JsonApiRequestInterceptor;

    /**
     * Json api response interceptor for adding additional behaviours.
     * 
     * @type {JsonApiResponseInterceptor}
     */
    public readonly jsonApiResponseInterceptor: JsonApiResponseInterceptor;

    /**
     * Headers sent with each request.
     * 
     * @type {Headers}
     */
    public readonly headers: Headers;

    /**
     * The browser cookie access policy
     */
    public readonly credentials: RequestCredentials;
    
    /**
     * Constructor.
     * 
     * @param {string} baseUrl Base url provided by developer. 
     * @param {JsonApiRequestInterceptor} jsonApiRequestInterceptor Json api request interceptor for adding additional behaviours.
     * @param {JsonApiResponseInterceptor} jsonApiResponseInterceptor Json api response interceptor for adding additional behaviours.
     */
    public constructor(
        baseUrl: string, 
        jsonApiRequestInterceptor: JsonApiRequestInterceptor, 
        jsonApiResponseInterceptor: JsonApiResponseInterceptor,
        credentials: RequestCredentials = 'same-origin',
    )
    {
        this.baseUrl = baseUrl.replace(new RegExp('\\/+$', 'g'), '');
        this.jsonApiRequestInterceptor = jsonApiRequestInterceptor;
        this.jsonApiResponseInterceptor = jsonApiResponseInterceptor;
        this.headers = this.buildHeaders();
        this.credentials = credentials;

        return;
    }

    /**
     * Builds base headers used for requests.
     * 
     * @returns {Headers} Headers used for requests.
     */
    private buildHeaders(): Headers
    {
        const headers = new Headers();

        headers.set('Content-Type', 'application/vnd.api+json');
        headers.set('Accept', 'application/vnd.api+json');

        return headers;
    }

    /**
     * Sends a get request using provided link object.
     * 
     * @param {LinkObject} linkObject Link object.
     * 
     * @returns {DocumentObject} Document object.
     */
    public async get(linkObject: LinkObject): Promise<DocumentObject>
    {
        const href = this.extractHref(linkObject);
        const headers = new Headers(this.headers);
        const request = new Request(href, { headers: headers, credentials: this.credentials, method: 'GET' });
        const interceptedRequest = this.jsonApiRequestInterceptor(request);
        const response = await fetch(interceptedRequest);
        const interceptedResponse = this.jsonApiResponseInterceptor(response);
        const responseDocumentObject = await this.extractDocumentObject(interceptedResponse);

        switch (interceptedResponse.status)
        {
            case 200:
                return responseDocumentObject;
            case 404:
                throw new NotFoundJsonApiError(href, responseDocumentObject);
            default:
                throw new OtherJsonApiError(href, response.status, responseDocumentObject);
        }
    }

    /**
     * Sends a post request using provided link and document object.
     * 
     * @param {LinkObject} linkObject Link object.
     * @param {DocumentObject} documentObject Document object.
     * 
     * @returns {DocumentObject} Document object.
     */
    public async post(linkObject: LinkObject, documentObject: DocumentObject): Promise<DocumentObject> 
    {
        const href = this.extractHref(linkObject);
        const body = JSON.stringify(documentObject);
        const headers = new Headers(this.headers);
        const request = new Request(href, { headers: headers, credentials: this.credentials, method: 'POST', body: body });
        const interceptedRequest = this.jsonApiRequestInterceptor(request);
        const response = await fetch(interceptedRequest);
        const interceptedResponse = this.jsonApiResponseInterceptor(response);
        const responseDocumentObject = await this.extractDocumentObject(interceptedResponse);

        switch (interceptedResponse.status)
        {
            case 201:
                return responseDocumentObject;
            case 202:
            case 204:
                return documentObject;
            case 403:
                throw new ForbiddenJsonApiError(href, responseDocumentObject);
            case 404:
                throw new NotFoundJsonApiError(href, responseDocumentObject);
            case 409:
                throw new ConflictJsonApiError(href, responseDocumentObject);
            default:
                throw new OtherJsonApiError(href, interceptedResponse.status, responseDocumentObject);
        }
    }

    /**
     * Sends a patch request using provided link and document object.
     * 
     * @param {LinkObject} linkObject Link object.
     * @param {DocumentObject} documentObject Document object.
     * 
     * @returns {DocumentObject} Document object.
     */
    public async patch(linkObject: LinkObject, documentObject: DocumentObject): Promise<DocumentObject>
    {
        const href = this.extractHref(linkObject);
        const body = JSON.stringify(documentObject);
        const headers = new Headers(this.headers);
        const request = new Request(href, { headers: headers, credentials: this.credentials, method: 'PATCH', body: body });
        const interceptedRequest = this.jsonApiRequestInterceptor(request);
        const response = await fetch(interceptedRequest);
        const interceptedResponse = this.jsonApiResponseInterceptor(response);
        const responseDocumentObject = await this.extractDocumentObject(interceptedResponse);

        switch (interceptedResponse.status)
        {
            case 200:
                return responseDocumentObject;
            case 202:
            case 204:
                return documentObject;
            case 403:
                throw new ForbiddenJsonApiError(href, responseDocumentObject);
            case 404:
                throw new NotFoundJsonApiError(href, responseDocumentObject);
            case 409:
                throw new ConflictJsonApiError(href, responseDocumentObject);
            default:
                throw new OtherJsonApiError(href, interceptedResponse.status, responseDocumentObject);
        }
    }

    /**
     * Sends a delete request using provided link object.
     * 
     * @param {LinkObject} linkObject Link object.
     * @param {DocumentObject} documentObject Document object.
     * 
     * @returns {DocumentObject} Document object.
     */
    public async delete(linkObject: LinkObject, documentObject: DocumentObject): Promise<void>
    {
        const href = this.extractHref(linkObject);
        const body = isEmpty(documentObject) ? undefined : JSON.stringify(documentObject);
        const headers = new Headers(this.headers);
        const request = new Request(href, { headers: headers, credentials: this.credentials, method: 'DELETE', body: body });
        const interceptedRequest = this.jsonApiRequestInterceptor(request);
        const response = await fetch(interceptedRequest);
        const interceptedResponse = this.jsonApiResponseInterceptor(response);
        const responseDocumentObject = await this.extractDocumentObject(interceptedResponse);

        switch (interceptedResponse.status)
        {
            case 200:
            case 202:
            case 204:
                return;
            case 404:
                throw new NotFoundJsonApiError(href, responseDocumentObject);
            default:
                throw new OtherJsonApiError(href, interceptedResponse.status, responseDocumentObject);
        }
    }

    /**
     * Extracts document object from response.
     * 
     * @param {Response} response Response.
     *  
     * @returns {DocumentObject} Document object.
     */
    private async extractDocumentObject(response: Response): Promise<DocumentObject>
    {
        try 
        {
            const json = await response.json();

            return isObject(json) ? json : {};
        }
        catch
        {
            return {};
        }
    }

    /**
     * Extracts href from link object.
     * 
     * @param {LinkObject} linkObject Link object.
     * 
     * @returns {string} Link href.
     */
    private extractHref(linkObject: LinkObject): string
    {
        return isString(linkObject) ? linkObject : linkObject.href;
    }
}
