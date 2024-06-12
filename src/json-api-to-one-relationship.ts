import { Entity, EntitySet, Nullable, PropertyInfo } from '@dipscope/entity-store';
import { JsonApiEntityProvider } from './json-api-entity-provider';
import { jsonApiRelationshipPath } from './json-api-relationship-path';
import { JsonApiToOneRelationshipProvider } from './json-api-to-one-relationship-provider';

/**
 * Json api to one relationship.
 * 
 * @type {JsonApiToOneRelationship<TEntity, TRelationship>}
 */
export class JsonApiToOneRelationship<TEntity extends Entity, TRelationship extends Entity>
{
    /**
     * Entity set.
     * 
     * @type {EntitySet<TEntity>}
     */
    public readonly entitySet: EntitySet<TEntity>;

    /**
     * Entity for which relationship is created.
     * 
     * @type {EntitySet<TEntity>}
     */
    public readonly entity: TEntity;

    /**
     * Property info of relationship.
     * 
     * @type {PropertyInfo<TRelationship>}
     */
    public readonly propertyInfo: PropertyInfo<TRelationship>;
    
    /**
     * Path which should be used to create a relationship.
     * 
     * @type {string}
     */
    public readonly path: string;

    /**
     * Relationship set.
     * 
     * @type {EntitySet<TRelationship>}
     */
    public readonly relationshipSet: EntitySet<TRelationship>;

    /**
     * Constructor.
     * 
     * @param {JsonApiEntityProvider} jsonApiEntityProvider Json api entity provider.
     * @param {EntitySet<TEntity>} entitySet Entity set.
     * @param {TEntity} entity Entity for which relationship is created.
     * @param {PropertyInfo<TRelationship>} propertyInfo Property info of relationship.
     * @param {string} path Path which should be used to create a relationship.
     */
    public constructor(
        jsonApiEntityProvider: JsonApiEntityProvider, 
        entitySet: EntitySet<TEntity>, 
        entity: TEntity,
        propertyInfo: PropertyInfo<TRelationship>,
        path: string = jsonApiRelationshipPath
    )
    {
        const jsonApiToOneRelationshipProvider = new JsonApiToOneRelationshipProvider(
            jsonApiEntityProvider.jsonApiConnection,
            jsonApiEntityProvider.jsonApiAdapter,
            entitySet.typeMetadata,
            entity,
            propertyInfo.propertyMetadata,
            path
        );

        this.entitySet = entitySet;
        this.entity = entity;
        this.propertyInfo = propertyInfo;
        this.path = path;
        this.relationshipSet = new EntitySet(propertyInfo.typeMetadata, jsonApiToOneRelationshipProvider);

        return;
    }

    /**
     * Finds one entity in a set.
     *
     * @returns {Promise<Nullable<TEntity>>} Entity or null.
     */
    public find(): Promise<Nullable<TRelationship>>
    {
        return this.relationshipSet.find();
    }
    
    /**
     * Updates a relationship.
     *
     * @param {TRelationship} relationship Relationship which should be updated.
     *
     * @returns {Promise<TRelationship>} Updated relationship.
     */
    public update(relationship: TRelationship): Promise<TRelationship>
    {
        return this.relationshipSet.update(relationship);
    }

    /**
     * Removes entity.
     *
     * @returns {Promise<void>}
     */
    public remove(): Promise<void>
    {
        return this.relationshipSet.batchRemove();
    }
}
