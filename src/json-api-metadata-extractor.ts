import { isNil, isNumber } from 'lodash';
import { DocumentObject } from './types/document-object';

/**
 * Json api metadata extractor.
 * 
 * @type {JsonApiMetadataExtractor}
 */
export class JsonApiMetadataExtractor
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
