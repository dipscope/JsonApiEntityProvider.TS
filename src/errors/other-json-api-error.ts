import { JsonApiError } from '../json-api-error';
import { DocumentObject } from '../types/document-object';

/**
 * Other json api error.
 * 
 * @type {OtherJsonApiError}
 */
export class OtherJsonApiError extends JsonApiError
{
    /**
     * Constructor.
     * 
     * @param {string} href Target href.
     * @param {number} status Status.
     * @param {DocumentObject} documentObject Document object.
     */
    public constructor(href: string, status: number, documentObject: DocumentObject)
    {
        super(`Error occured while accesing the resource ${href}.`, href, status, documentObject);

        Object.setPrototypeOf(this, new.target.prototype);

        return;
    }
}
