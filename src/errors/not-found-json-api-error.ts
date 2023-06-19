import { JsonApiError } from '../json-api-error';
import { DocumentObject } from '../types/document-object';

/**
 * Not found json api error.
 * 
 * @type {NotFoundJsonApiError}
 */
export class NotFoundJsonApiError extends JsonApiError
{
    /**
     * Constructor.
     * 
     * @param {string} href Target href.
     * @param {DocumentObject} documentObject Document object.
     */
    public constructor(href: string, documentObject: DocumentObject)
    {
        super(`Target resource ${href} does not exists.`, href, 404, documentObject);

        Object.setPrototypeOf(this, new.target.prototype);

        return;
    }
}
