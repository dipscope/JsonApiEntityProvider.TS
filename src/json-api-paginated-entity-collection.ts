import isNil from 'lodash/isNil';
import { Entity, EntityCollection, PaginatedEntityCollection } from '@dipscope/entity-store';
import { TypeMetadata } from '@dipscope/type-manager';
import { JsonApiAdapter } from './json-api-adapter';
import { LinkObject } from './types/link-object';

/**
 * Represents json api paginated entity collection.
 * 
 * @type {JsonApiPaginatedEntityCollection<TEntity>}
 */
export class JsonApiPaginatedEntityCollection<TEntity extends Entity> extends PaginatedEntityCollection<TEntity>
{
    /**
     * Entity type metadata.
     * 
     * @type {TypeMetadata<TEntity>}
     */
    public readonly typeMetadata: TypeMetadata<TEntity>;

    /**
     * Json api adapter.
     * 
     * @type {JsonApiAdapter}
     */
    public readonly jsonApiAdapter: JsonApiAdapter;

    /**
     * First link object.
     * 
     * @type {LinkObject}
     */
    public readonly firstLinkObject?: LinkObject;

    /**
     * Last link object.
     * 
     * @type {LinkObject}
     */
    public readonly lastLinkObject?: LinkObject;

    /**
     * Next link object.
     * 
     * @type {LinkObject}
     */
    public readonly nextLinkObject?: LinkObject;

    /**
     * Prev link object.
     * 
     * @type {LinkObject}
     */
    public readonly prevLinkObject?: LinkObject;

    /**
     * Constructor.
     * 
     * @param {EntityCollection<TEntity>|Array<TEntity>} entityCollectionOrEntities Entity collection or entities.
     * @param {TypeMetadata<TEntity>} typeMetadata Entity type metadata.
     * @param {JsonApiAdapter} jsonApiAdapter Json api adapter.
     * @param {number} totalLength Total length.
     * @param {LinkObject} firstLinkObject First link object.
     * @param {LinkObject} lastLinkObject Last link object.
     * @param {LinkObject} nextLinkObject Next link object.
     * @param {LinkObject} prevLinkObject Prev link object.
     */
    public constructor(
        entityCollectionOrEntities: EntityCollection<TEntity>|Array<TEntity>,
        typeMetadata: TypeMetadata<TEntity>,
        jsonApiAdapter: JsonApiAdapter,
        totalLength?: number,
        firstLinkObject?: LinkObject,
        lastLinkObject?: LinkObject,
        nextLinkObject?: LinkObject,
        prevLinkObject?: LinkObject
    ) 
    {
        super(entityCollectionOrEntities, totalLength);

        this.typeMetadata = typeMetadata;
        this.jsonApiAdapter = jsonApiAdapter;
        this.firstLinkObject = firstLinkObject;
        this.lastLinkObject = lastLinkObject;
        this.nextLinkObject = nextLinkObject;
        this.prevLinkObject = prevLinkObject;

        return;
    }

    /**
     * Gets next page of entity collection.
     *
     * @returns {Promise<JsonApiPaginatedEntityCollection<TEntity>>} Next page of entity collection.
     */
    public async nextPage(): Promise<JsonApiPaginatedEntityCollection<TEntity>>
    {
        if (isNil(this.nextLinkObject))
        {
            return new JsonApiPaginatedEntityCollection([], this.typeMetadata, this.jsonApiAdapter, this.totalLength, this.firstLinkObject, this.lastLinkObject);
        }

        const responseDocumentObject = await this.jsonApiAdapter.jsonApiConnection.get(this.nextLinkObject);
        const responseEntityCollection = this.jsonApiAdapter.createDocumentObjectPaginatedEntityCollection(this.typeMetadata, responseDocumentObject);

        return responseEntityCollection;
    }

    /**
     * Checks if entity collection has next page.
     *
     * @returns {boolean} True when entity collection has next page. False otherwise.
     */
    public hasNextPage(): boolean
    {
        return !isNil(this.nextLinkObject);
    }

    /**
     * Gets prev page of entity collection.
     *
     * @returns {Promise<JsonApiPaginatedEntityCollection<TEntity>>} Prev page of entity collection.
     */
    public async prevPage(): Promise<JsonApiPaginatedEntityCollection<TEntity>>
    {
        if (isNil(this.prevLinkObject))
        {
            return new JsonApiPaginatedEntityCollection([], this.typeMetadata, this.jsonApiAdapter, this.totalLength, this.firstLinkObject, this.lastLinkObject);
        }

        const responseDocumentObject = await this.jsonApiAdapter.jsonApiConnection.get(this.prevLinkObject);
        const responseEntityCollection = this.jsonApiAdapter.createDocumentObjectPaginatedEntityCollection(this.typeMetadata, responseDocumentObject);

        return responseEntityCollection;
    }

    /**
     * Checks if entity collection has prev page.
     *
     * @returns {boolean} True when entity collection has prev page. False otherwise.
     */
    public hasPrevPage(): boolean
    {
        return !isNil(this.prevLinkObject);
    }
}
