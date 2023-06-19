import { EntityStoreError } from '@dipscope/entity-store';
import { DocumentObject } from './types/document-object';

/**
 * Represents json api error.
 * 
 * @type {JsonApiError}
 */
export class JsonApiError extends EntityStoreError
{
    /**
     * Target href.
     * 
     * @type {string}
     */
    public readonly href: string;

    /**
     * Http status represented as number.
     * 
     * @type {number}
     */
    public readonly status: number;

    /**
     * Document object returned from api.
     * 
     * @type {DocumentObject}
     */
    public readonly documentObject: DocumentObject

    /**
     * Constructor.
     * 
     * @param {string} message Message.
     * @param {string} href Href.
     * @param {number} status Status.
     * @param {DocumentObject} status Document object.
     */
    public constructor(message: string, href: string, status: number, documentObject: DocumentObject)
    {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);

        this.href = href;
        this.status = status;
        this.documentObject = documentObject;

        return;
    }
}
