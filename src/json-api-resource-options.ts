/**
 * Represents json api resource options.
 * 
 * @type {JsonApiResourceOptions}
 */
export interface JsonApiResourceOptions
{
    /**
     * Resource type as described in specification.
     * 
     * @type {string}
     */
    type?: string;

    /**
     * Resource route as described in specification.
     * 
     * @type {string}
     */
    route?: string;
}
