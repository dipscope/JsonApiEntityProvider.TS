import { EntityStoreError } from '@dipscope/entity-store';
import { TypeMetadata } from '@dipscope/type-manager';

/**
 * Error thrown when json api resource metadata not found for a type. This is usually
 * caused by invalid configuration.
 * 
 * @type {JsonApiResourceMetadataNotFoundError}
 */
export class JsonApiResourceMetadataNotFoundError extends EntityStoreError
{
    /**
     * Type metadata where json api resource metadata was not found.
     * 
     * @type {TypeMetadata<any>}
     */
    public readonly typeMetadata: TypeMetadata<any>;

    /**
     * Constructor.
     * 
     * @param {TypeMetadata<any>} typeMetadata Type metadata where json api resource metadata was not found.
     */
    public constructor(typeMetadata: TypeMetadata<any>)
    {
        super(`${typeMetadata.typeName}: cannot define json api resource metadata of a type. This is usually caused by invalid configuration.`);
        
        Object.setPrototypeOf(this, new.target.prototype);

        this.typeMetadata = typeMetadata;

        return;
    }
}
