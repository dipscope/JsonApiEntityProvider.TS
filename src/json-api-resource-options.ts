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
     * Property name representing id if differs from one 
     * described in specification.
     * 
     * @type {string}
     */
    id?: string;
}
