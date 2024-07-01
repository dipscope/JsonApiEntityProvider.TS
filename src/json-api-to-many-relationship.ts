import { isEmpty, isNil } from 'lodash';
import { Entity, EntityCollection, EntityCollectionLike, EntitySet, PaginateClause } from '@dipscope/entity-store';
import { FilterClause, GenericMetadataNotFoundError, IncludeBrowseCommandBuilder } from '@dipscope/entity-store';
import { IncludeClause, IncludeCollectionClause, PaginatedEntityCollection, PropertyInfo } from '@dipscope/entity-store';
import { RootBrowseCommandBuilder, SortBrowseCommandBuilder, SortClause } from '@dipscope/entity-store';
import { TypeMetadata } from '@dipscope/type-manager';
import { JsonApiEntityProvider } from './json-api-entity-provider';
import { jsonApiRelationshipPath } from './json-api-relationship-path';
import { JsonApiToManyRelationshipProvider } from './json-api-to-many-relationship-provider';

/**
 * Json api to many relationship.
 * 
 * @type {JsonApiToManyRelationship<TEntity, TRelationship>}
 */
export class JsonApiToManyRelationship<TEntity extends Entity, TRelationship extends Entity>
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
     * @type {PropertyInfo<EntityCollection<TRelationship>>}
     */
    public readonly propertyInfo: PropertyInfo<EntityCollection<TRelationship>>;

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
     * @param {PropertyInfo<EntityCollection<TRelationship>>} propertyInfo Property info of relationship.
     * @param {string} path Path which should be used to create a relationship.
     */
    public constructor(
        jsonApiEntityProvider: JsonApiEntityProvider, 
        entitySet: EntitySet<TEntity>, 
        entity: TEntity,
        propertyInfo: PropertyInfo<EntityCollection<TRelationship>>,
        path: string = jsonApiRelationshipPath
    )
    {
        const collectionGenericMetadatas = propertyInfo.propertyMetadata.genericMetadatas;

        if (isNil(collectionGenericMetadatas) || isEmpty(collectionGenericMetadatas))
        {
            throw new GenericMetadataNotFoundError(propertyInfo.path);
        }

        const relationshipTypeMetadata = collectionGenericMetadatas[0][0] as TypeMetadata<TRelationship>;
        const jsonApiToManyRelationshipProvider = new JsonApiToManyRelationshipProvider(
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
        this.relationshipSet = new EntitySet(relationshipTypeMetadata, jsonApiToManyRelationshipProvider);

        return;
    }

    /**
     * Filters relationship set.
     *
     * @param {FilterClause<TRelationship>} filterClause Filter clause.
     *
     * @returns {RootBrowseCommandBuilder<TRelationship>} Root browse command builder.
     */
    public filter(filterClause: FilterClause<TRelationship>): RootBrowseCommandBuilder<TRelationship> 
    {
        return this.relationshipSet.filter(filterClause);
    }

    /**
     * Sorts relationship set in ascending order.
     *
     * @param {SortClause<TRelationship, TProperty>} sortClause Sort clause.
     *
     * @returns {SortBrowseCommandBuilder<TRelationship>} Sort browse command builder.
     */
    public sortByAsc<TProperty>(sortClause: SortClause<TRelationship, TProperty>): SortBrowseCommandBuilder<TRelationship> 
    {
        return this.relationshipSet.sortByAsc(sortClause);
    }
    
    /**
     * Sorts relationship set in descending order.
     *
     * @param {SortClause<TRelationship, TProperty>} sortClause Sort clause.
     *
     * @returns {SortBrowseCommandBuilder<TRelationship>} Sort browse command builder.
     */
    public sortByDesc<TProperty>(sortClause: SortClause<TRelationship, TProperty>): SortBrowseCommandBuilder<TRelationship>
    {
        return this.relationshipSet.sortByDesc(sortClause);
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
     * Paginates relationship set.
     *
     * @param {PaginateClause<TRelationship>} paginateClause Paginate clause.
     *
     * @returns {RootBrowseCommandBuilder<TRelationship>} Root browse command builder.
     */
    public paginate(paginateClause: PaginateClause<TRelationship>): RootBrowseCommandBuilder<TRelationship> 
    {
        return this.relationshipSet.paginate(paginateClause);
    }

    /**
     * Finds all relationships in a set.
     *
     * @returns {Promise<PaginatedEntityCollection<TRelationship>>} Paginated relationship collection.
     */
    public findAll(): Promise<PaginatedEntityCollection<TRelationship>> 
    {
        return this.relationshipSet.findAll();
    }

    /**
     * Adds a relationship.
     *
     * @param {TRelationship} relationship Relationship which should be added.
     *
     * @returns {Promise<TRelationship>} Added entity.
     */
    public add(relationship: TRelationship): Promise<TRelationship>
    {
        return this.relationshipSet.add(relationship);
    }

    /**
     * Bulk adds a relationship collection.
     *
     * @param {EntityCollectionLike<TRelationship>} relationshipCollectionLike Relationship collection like which should be added.
     *
     * @returns {Promise<EntityCollection<TRelationship>>} Added entity collection.
     */
    public bulkAdd(relationshipCollectionLike: EntityCollectionLike<TRelationship>): Promise<EntityCollection<TRelationship>>
    {
        return this.relationshipSet.bulkAdd(relationshipCollectionLike);
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
     * Bulk updates a relationship collection.
     *
     * @param {EntityCollectionLike<TRelationship>} relationshipCollectionLike Relationship collection like which should be updated.
     *
     * @returns {Promise<EntityCollection<TRelationship>>} Updated relationship collection.
     */
    public bulkUpdate(relationshipCollectionLike: EntityCollectionLike<TRelationship>): Promise<EntityCollection<TRelationship>>
    {
        return this.relationshipSet.bulkUpdate(relationshipCollectionLike);
    }

    /**
     * Removes a relationship.
     *
     * @param {TRelationship} relationship Relationship which should be removed.
     *
     * @returns {Promise<TRelationship>} Removed relationship.
     */
    public remove(relationship: TRelationship): Promise<TRelationship>
    {
        return this.relationshipSet.remove(relationship);
    }

    /**
     * Bulk removes a relationship collection.
     *
     * @param {EntityCollectionLike<TRelationship>} relationshipCollectionLike Relationship collection like which should be removed.
     *
     * @returns {Promise<EntityCollection<TRelationship>>} Removed relationship collection.
     */
    public bulkRemove(relationshipCollectionLike: EntityCollectionLike<TRelationship>): Promise<EntityCollection<TRelationship>>
    {
        return this.relationshipSet.bulkRemove(relationshipCollectionLike);
    }
    
    /**
     * Saves a child entity.
     *
     * @param {TRelationship} relationship Child entity to be saved.
     *
     * @returns {Promise<TRelationship>} Saved entity.
     */
    public save(relationship: TRelationship): Promise<TRelationship>
    {
        return this.relationshipSet.save(relationship);
    }

    /**
     * Bulk saves a child entities collection.
     *
     * @param {EntityCollectionLike<TRelationship>} relationshipCollectionLike Child entities collection to be saved.
     *
     * @returns {Promise<EntityCollection<TRelationship>>} Saved entity collection.
     */
    public bulkSave(relationshipCollectionLike: EntityCollectionLike<TRelationship>): Promise<EntityCollection<TRelationship>>
    {
        return this.relationshipSet.bulkSave(relationshipCollectionLike);
    }
}
