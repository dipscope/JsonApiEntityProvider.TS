import { DocumentObject } from './types/document-object';

/**
 * Json api metadata extractor.
 * 
 * @type {JsonApiMetadataExtractor}
 */
export abstract class JsonApiMetadataExtractor
{
    /**
     * Extracts total entity count from document object.
     * 
     * @param {DocumentObject} documentObject Document object.
     * 
     * @returns {number} Total number of entities or undefined if it is not known. 
     */
    public abstract extractTotalEntityCount(documentObject: DocumentObject): number | undefined;
}
