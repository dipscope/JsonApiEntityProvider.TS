import { isUndefined } from 'lodash';
import { Entity } from '@dipscope/entity-store';
import { TypeExtensionMetadata, TypeMetadata } from '@dipscope/type-manager';
import { JsonApiResourceOptions } from './json-api-resource-options';
import { jsonApiResourceRouteKey } from './json-api-resource-route-key';
import { jsonApiResourceType } from './json-api-resource-type';
import { jsonApiResourceTypeKey } from './json-api-resource-type-key';

/**
 * Json api resource metadata.
 * 
 * @type {JsonApiResourceMetadata<TEntity>}
 */
export class JsonApiResourceMetadata<TEntity extends Entity> extends TypeExtensionMetadata<TEntity, JsonApiResourceOptions>
{
    /**
     * Constructor.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {JsonApiResourceOptions} jsonApiResourceOptions Json api resource options.
     */
    public constructor(typeMetadata: TypeMetadata<TEntity>, jsonApiResourceOptions: JsonApiResourceOptions)
    {
        super(typeMetadata, jsonApiResourceOptions);

        return;
    }

    /**
     * Gets resource type.
     * 
     * @returns {string} Resource type.
     */
    public get type(): string
    {
        return this.typeMetadata.extractCustomValue(jsonApiResourceTypeKey) ?? this.typeMetadata.typeName;
    }

    /**
     * Gets resource route.
     * 
     * @returns {string} Resource route.
     */
    public get route(): string
    {
        return this.typeMetadata.extractCustomValue(jsonApiResourceRouteKey) ?? this.type;
    }

    /**
     * Configures type.
     * 
     * @param {string|undefined} type Type.
     * 
     * @returns {this} Current instance of json api resource metadata. 
     */
    public hasType(type: string | undefined): this
    {
        this.typeMetadata.hasCustomValue(jsonApiResourceTypeKey, type)
            .hasDiscriminator(jsonApiResourceType)
            .hasDiscriminant(this.type)
            .shouldPreserveDiscriminator();

        return this;
    }

    /**
     * Configures route.
     * 
     * @param {string|undefined} route Route.
     * 
     * @returns {this} Current instance of json api resource metadata. 
     */
    public hasRoute(route: string | undefined): this
    {
        this.typeMetadata.hasCustomValue(jsonApiResourceRouteKey, route);

        return this;
    }
    
    /**
     * Configures json api resource metadata based on provided options.
     * 
     * @param {JsonApiResourceOptions} jsonApiResourceOptions Json api resource options.
     * 
     * @returns {this} Current instance of json api resource metadata.
     */
    public configure(jsonApiResourceOptions: JsonApiResourceOptions): this
    {
        if (!isUndefined(jsonApiResourceOptions.type))
        {
            this.hasType(jsonApiResourceOptions.type);
        }

        if (!isUndefined(jsonApiResourceOptions.route))
        {
            this.hasRoute(jsonApiResourceOptions.route);
        }

        return this;
    }
}
