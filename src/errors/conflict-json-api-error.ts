import { JsonApiError } from '../json-api-error';
import { DocumentObject } from '../types/document-object';

/**
 * Conflict json api error.
 * 
 * @type {ConflictJsonApiError}
 */
export class ConflictJsonApiError extends JsonApiError
{
    /**
     * Constructor.
     * 
     * @param {string} href Target href.
     * @param {DocumentObject} documentObject Document object.
     */
    public constructor(href: string, documentObject: DocumentObject)
    {
        super(`There was a conflict while processing a request to ${href}. Resource may have a wrong type or violation id or attribute.`, href, 409, documentObject);
        
        Object.setPrototypeOf(this, new.target.prototype);

        return;
    }
}
