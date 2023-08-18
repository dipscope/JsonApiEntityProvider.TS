import { isUndefined } from 'lodash';
import { Entity } from '@dipscope/entity-store';
import { TypeExtensionMetadata, TypeMetadata } from '@dipscope/type-manager';
import { jsonApiResourceId } from './json-api-resource-id';
import { jsonApiResourceIdKey } from './json-api-resource-id-key';
import { JsonApiResourceOptions } from './json-api-resource-options';
import { jsonApiResourceRouteKey } from './json-api-resource-route-key';
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
        return this.typeMetadata.extractCustomOption(jsonApiResourceTypeKey) ?? this.typeMetadata.typeName;
    }

    /**
     * Gets resource route.
     * 
     * @returns {string} Resource route.
     */
    public get route(): string
    {
        return this.typeMetadata.extractCustomOption(jsonApiResourceRouteKey) ?? this.type;
    }

    /**
     * Gets property name representing id.
     * 
     * @returns {string} Property name representing id.
     */
    public get id(): string
    {
        return this.typeMetadata.extractCustomOption(jsonApiResourceIdKey) ?? jsonApiResourceId;
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
        this.typeMetadata.hasCustomOption(jsonApiResourceTypeKey, type);

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
        this.typeMetadata.hasCustomOption(jsonApiResourceRouteKey, route);

        return this;
    }

    /**
     * Configures id.
     * 
     * @param {string|undefined} id Id.
     * 
     * @returns {this} Current instance of json api resource metadata. 
     */
    public hasId(id: string | undefined): this
    {
        this.typeMetadata.hasCustomOption(jsonApiResourceIdKey, id);

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

        if (!isUndefined(jsonApiResourceOptions.id))
        {
            this.hasId(jsonApiResourceOptions.id);
        }

        return this;
    }
}
