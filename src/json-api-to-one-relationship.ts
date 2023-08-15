import { Entity, EntitySet, IncludeBrowseCommandBuilder, IncludeClause, IncludeCollectionClause, Nullable, PropertyInfo } from '@dipscope/entity-store';
import { JsonApiEntityProvider } from './json-api-entity-provider';
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
     */
    public constructor(
        jsonApiEntityProvider: JsonApiEntityProvider, 
        entitySet: EntitySet<TEntity>, 
        entity: TEntity,
        propertyInfo: PropertyInfo<TRelationship>
    )
    {
        const jsonApiToOneRelationshipProvider = new JsonApiToOneRelationshipProvider(
            jsonApiEntityProvider.jsonApiConnection,
            jsonApiEntityProvider.jsonApiAdapter,
            entitySet.typeMetadata,
            entity,
            propertyInfo.propertyMetadata
        );

        this.entitySet = entitySet;
        this.entity = entity;
        this.propertyInfo = propertyInfo;
        this.relationshipSet = new EntitySet(propertyInfo.typeMetadata, jsonApiToOneRelationshipProvider);

        return;
    }

    /**
     * Finds one entity in a set.
     *
     * @returns {Promise<Nullable<TEntity>>} Entity or null.
     */
    public findOne(): Promise<Nullable<TRelationship>>
    {
        return this.relationshipSet.findOne();
    }
    
    /**
     * Includes entity for eager loading.
     *
     * @param {IncludeClause<TRelationship, TProperty>} includeClause Include clause.
     *
     * @returns {IncludeBrowseCommandBuilder<TRelationship, TProperty>} Include browse command builder.
     */
    public include<TProperty extends Entity>(includeClause: IncludeClause<TRelationship, TProperty>): IncludeBrowseCommandBuilder<TRelationship, TProperty> 
    {
        return this.relationshipSet.include(includeClause);
    }

    /**
     * Includes entity collection for eager loading.
     *
     * @param {IncludeCollectionClause<TRelationship, TProperty>} includeCollectionClause Include collection clause.
     *
     * @returns {IncludeBrowseCommandBuilder<TRelationship, TProperty>} Include browse command builder.
     */
    public includeCollection<TProperty extends Entity>(includeCollectionClause: IncludeCollectionClause<TRelationship, TProperty>): IncludeBrowseCommandBuilder<TRelationship, TProperty> 
    {
        return this.relationshipSet.includeCollection(includeCollectionClause);
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
