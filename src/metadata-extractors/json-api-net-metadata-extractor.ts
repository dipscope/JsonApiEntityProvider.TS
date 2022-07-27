import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import { JsonApiMetadataExtractor } from '../json-api-metadata-extractor';
import { DocumentObject } from '../types/document-object';

/**
 * Json api net metadata extractor implementation.
 * 
 * @type {JsonApiNetMetadataExtractor}
 */
export class JsonApiNetMetadataExtractor extends JsonApiMetadataExtractor
{
    /**
     * Extracts total entity count from document object.
     * 
     * @param {DocumentObject} documentObject Document object.
     * 
     * @returns {number} Total number of entities or undefined if it is not known. 
     */
    public extractTotalEntityCount(documentObject: DocumentObject): number | undefined
    {
        const meta = documentObject.meta;
        
        if (!isNil(meta) && isNumber(meta.total))
        {
            return meta.total;
        }

        return undefined;
    }
}
