import { PropertyInfo } from '@dipscope/entity-store';

/**
 * Base class for json api expression visitors.
 * 
 * @type {JsonApiExpressionVisitor}
 */
export abstract class JsonApiExpressionVisitor
{
    /**
     * Prefix which prepended right before returned result.
     * 
     * @type {string}
     */
    public readonly prefix: string;

    /**
     * Constructor.
     * 
     * @param {string} prefix Prefix which prepended right before returned result.
     */
    public constructor(prefix: string)
    {
        this.prefix = prefix;

        return;
    }

    /**
     * Serializes value based on property info.
     * 
     * @param {PropertyInfo<any>} propertyInfo Property info.
     * @param {any} value Value.
     * 
     * @returns {any} Serialized value.
     */
    protected serializeValue(propertyInfo: PropertyInfo<any>, value: any): any
    {
        const typeMetadata = propertyInfo.propertyMetadata.typeMetadata;
        const serializerContext = typeMetadata.typeManager.defineSerializerContext(typeMetadata.typeFn, value);
        const serializedValue = serializerContext.serialize(value);

        return serializedValue;
    }
}
