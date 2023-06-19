import { JsonApiError } from '../json-api-error';
import { DocumentObject } from '../types/document-object';

/**
 * Forbidden json api error.
 * 
 * @type {ForbiddenJsonApiError}
 */
export class ForbiddenJsonApiError extends JsonApiError
{
    /**
     * Constructor.
     * 
     * @param {string} href Target href.
     * @param {DocumentObject} documentObject Document object.
     */
    public constructor(href: string, documentObject: DocumentObject)
    {
        super(`Unsupported request ${href} is sent to create a resource.`, href, 403, documentObject);
        
        Object.setPrototypeOf(this, new.target.prototype);

        return;
    }
}
