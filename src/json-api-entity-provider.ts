import { first, isNil, merge, toString } from 'lodash';
import { AddCommand, BatchRemoveCommand, BatchUpdateCommand, CommandNotSupportedError, EntitySet } from '@dipscope/entity-store';
import { IncludeClause, IncludeCollectionClause, PaginatedEntityCollection } from '@dipscope/entity-store';
import { BulkAddCommand, BulkQueryCommand, BulkRemoveCommand, BulkSaveCommand } from '@dipscope/entity-store';
import { BulkUpdateCommand, QueryCommand, RemoveCommand, SaveCommand, UpdateCommand } from '@dipscope/entity-store';
import { Entity, EntityCollection, EntityProvider, Nullable } from '@dipscope/entity-store';
import { JsonApiNetFilterExpressionVisitor } from './filter-expression-visitors/json-api-net-filter-expression-visitor';
import { JsonApiAdapter } from './json-api-adapter';
import { JsonApiConnection } from './json-api-connection';
import { JsonApiEntityProviderOptions } from './json-api-entity-provider-options';
import { JsonApiIncludeExpressionVisitor } from './json-api-include-expression-visitor';
import { JsonApiSortExpressionVisitor } from './json-api-sort-expression-visitor';
import { JsonApiToManyRelationship } from './json-api-to-many-relationship';
import { JsonApiToOneRelationship } from './json-api-to-one-relationship';
import { JsonApiNetMetadataExtractor } from './metadata-extractors/json-api-net-metadata-extractor';
import { JsonApiNetPaginateExpressionVisitor } from './paginate-expression-visitors/json-api-net-paginate-expression-visitor';

/**
 * Json api implementation of entity provider.
 * 
 * @type {JsonApiEntityProvider}
 */
export class JsonApiEntityProvider implements EntityProvider 
{
    /**
     * Connection to json api.
     * 
     * @type {JsonApiConnection}
     */
    public readonly jsonApiConnection: JsonApiConnection;

    /**
     * Json api adapter to transform entities to propper document objects and back.
     * 
     * @type {JsonApiAdapter}
     */
    public readonly jsonApiAdapter: JsonApiAdapter;

    /**
     * Constructor.
     * 
     * @param {JsonApiEntityProviderOptions} jsonApiEntityProviderOptions Json api entity provider options.
     */
    public constructor(jsonApiEntityProviderOptions: JsonApiEntityProviderOptions)
    {
        const defaultJsonApiRequestInterceptor = (request: Request) => request;
        const defaultJsonApiResponseInterceptor = (response: Response) => response;
        const jsonApiRequestInterceptor = jsonApiEntityProviderOptions.jsonApiRequestInterceptor ?? defaultJsonApiRequestInterceptor;
        const jsonApiResponseInterceptor = jsonApiEntityProviderOptions.jsonApiResponseInterceptor ?? defaultJsonApiResponseInterceptor;
        const allowToManyRelationshipReplacement = jsonApiEntityProviderOptions.allowToManyRelationshipReplacement ?? false;
        const jsonApiMetadataExtractor = jsonApiEntityProviderOptions.jsonApiMetadataExtractor ?? new JsonApiNetMetadataExtractor();
        const jsonApiFilterExpressionVisitor = jsonApiEntityProviderOptions.jsonApiFilterExpressionVisitor ?? new JsonApiNetFilterExpressionVisitor();
        const jsonApiPaginateExpressionVisitor = jsonApiEntityProviderOptions.jsonApiPaginateExpressionVisitor ?? new JsonApiNetPaginateExpressionVisitor();
        const jsonApiSortExpressionVisitor = new JsonApiSortExpressionVisitor();
        const jsonApiIncludeExpressionVisitor = new JsonApiIncludeExpressionVisitor();

        this.jsonApiConnection = new JsonApiConnection(jsonApiEntityProviderOptions.baseUrl, jsonApiRequestInterceptor, jsonApiResponseInterceptor);
        this.jsonApiAdapter = new JsonApiAdapter(this.jsonApiConnection, jsonApiMetadataExtractor, jsonApiFilterExpressionVisitor, jsonApiPaginateExpressionVisitor, jsonApiSortExpressionVisitor, jsonApiIncludeExpressionVisitor, allowToManyRelationshipReplacement);

        return;
    }

    /**
     * Executes add command.
     * 
     * @param {AddCommand<TEntity>} addCommand Add command.
     * 
     * @returns {Promise<TEntity>} Added entity.
     */
    public async executeAddCommand<TEntity extends Entity>(addCommand: AddCommand<TEntity>): Promise<TEntity>
    {
        const typeMetadata = addCommand.entityInfo.typeMetadata;
        const requestEntity = addCommand.entity;
        const requestDocumentObject = this.jsonApiAdapter.createEntityDocumentObject(typeMetadata, requestEntity);
        const linkObject = this.jsonApiAdapter.createResourceLinkObject(typeMetadata);
        const responseDocumentObject = await this.jsonApiConnection.post(linkObject, requestDocumentObject);
        const responseEntity = this.jsonApiAdapter.createDocumentObjectEntity(typeMetadata, responseDocumentObject);

        if (isNil(responseEntity))
        {
            return requestEntity;
        }

        return merge(requestEntity, responseEntity);
    }

    /**
     * Executes bulk add command.
     * 
     * @param {BulkAddCommand<TEntity>} bulkAddCommand Bulk add command.
     * 
     * @returns {Promise<EntityCollection<TEntity>>} Added entity collection.
     */
    public async executeBulkAddCommand<TEntity extends Entity>(bulkAddCommand: BulkAddCommand<TEntity>): Promise<EntityCollection<TEntity>>
    {
        const entityInfo = bulkAddCommand.entityInfo;
        const requestEntityCollection = bulkAddCommand.entityCollection;
        const responseEntityPromises = new Array<Promise<TEntity>>();

        for (const requestEntity of requestEntityCollection) 
        {
            const addCommand = new AddCommand<TEntity>(entityInfo, requestEntity);
            const responseEntityPromise = this.executeAddCommand(addCommand);

            responseEntityPromises.push(responseEntityPromise);
        }

        const responseEntities = await Promise.all(responseEntityPromises);
        const responseEntityCollection = new EntityCollection<TEntity>(responseEntities);

        return responseEntityCollection;
    }

    /**
     * Executes update command.
     * 
     * @param {UpdateCommand<TEntity>} updateCommand Update command.
     * 
     * @returns {Promise<TEntity>} Updated entity.
     */
    public async executeUpdateCommand<TEntity extends Entity>(updateCommand: UpdateCommand<TEntity>): Promise<TEntity>
    {
        const typeMetadata = updateCommand.entityInfo.typeMetadata;
        const requestEntity = updateCommand.entity;
        const requestDocumentObject = this.jsonApiAdapter.createEntityDocumentObject(typeMetadata, requestEntity);
        const linkObject = this.jsonApiAdapter.createResourceIdentifierLinkObject(typeMetadata, requestEntity);
        const responseDocumentObject = await this.jsonApiConnection.patch(linkObject, requestDocumentObject);
        const responseEntity = this.jsonApiAdapter.createDocumentObjectEntity(typeMetadata, responseDocumentObject);

        if (isNil(responseEntity))
        {
            return requestEntity;
        }

        return merge(requestEntity, responseEntity);
    }

    /**
     * Executes bulk update command.
     * 
     * @param {BulkUpdateCommand<TEntity>} bulkUpdateCommand Bulk update command.
     * 
     * @returns {Promise<EntityCollection<TEntity>>} Updated entity collection.
     */
    public async executeBulkUpdateCommand<TEntity extends Entity>(bulkUpdateCommand: BulkUpdateCommand<TEntity>): Promise<EntityCollection<TEntity>>
    {
        const entityInfo = bulkUpdateCommand.entityInfo;
        const requestEntityCollection = bulkUpdateCommand.entityCollection;
        const responseEntityPromises = new Array<Promise<TEntity>>();

        for (const requestEntity of requestEntityCollection) 
        {
            const updateCommand = new UpdateCommand<TEntity>(entityInfo, requestEntity);
            const responseEntityPromise = this.executeUpdateCommand(updateCommand);

            responseEntityPromises.push(responseEntityPromise);
        }

        const responseEntities = await Promise.all(responseEntityPromises);
        const responseEntityCollection = new EntityCollection<TEntity>(responseEntities);

        return responseEntityCollection;
    }

    /**
     * Executes batch update command.
     * 
     * @param {BatchUpdateCommand<TEntity>} batchUpdateCommand Batch update command.
     * 
     * @returns {Promise<void>} Promise to update an entity collection.
     */
    public async executeBatchUpdateCommand<TEntity extends Entity>(batchUpdateCommand: BatchUpdateCommand<TEntity>): Promise<void>
    {
        throw new CommandNotSupportedError(batchUpdateCommand, this);
    }

    /**
     * Executes save command.
     * 
     * @param {SaveCommand<TEntity>} saveCommand Save command.
     * 
     * @returns {Promise<TEntity>} Saved entity.
     */
    public async executeSaveCommand<TEntity extends Entity>(saveCommand: SaveCommand<TEntity>): Promise<TEntity>
    {
        const entityInfo = saveCommand.entityInfo;
        const entity = saveCommand.entity;
        const resourceIdentifier = this.jsonApiAdapter.extractResourceIdentifier(entityInfo.typeMetadata, entity);

        if (isNil(resourceIdentifier))
        {
            const addCommand = new AddCommand(entityInfo, entity);

            return await this.executeAddCommand(addCommand);
        }

        const updateCommand = new UpdateCommand(entityInfo, entity);

        return await this.executeUpdateCommand(updateCommand);
    }

    /**
     * Executes bulk save command.
     * 
     * @param {BulkSaveCommand<TEntity>} bulkSaveCommand Bulk save command.
     * 
     * @returns {Promise<EntityCollection<TEntity>>} Saved entity collection.
     */
    public async executeBulkSaveCommand<TEntity extends Entity>(bulkSaveCommand: BulkSaveCommand<TEntity>): Promise<EntityCollection<TEntity>>
    {
        const entityInfo = bulkSaveCommand.entityInfo;
        const requestEntityCollection = bulkSaveCommand.entityCollection;
        const responseEntityPromises = new Array<Promise<TEntity>>();

        for (const requestEntity of requestEntityCollection) 
        {
            const saveCommand = new SaveCommand<TEntity>(entityInfo, requestEntity);
            const responseEntityPromise = this.executeSaveCommand(saveCommand);

            responseEntityPromises.push(responseEntityPromise);
        }

        const responseEntities = await Promise.all(responseEntityPromises);
        const responseEntityCollection = new EntityCollection<TEntity>(responseEntities);

        return responseEntityCollection;
    }

    /**
     * Executes query command.
     * 
     * @param {QueryCommand<TEntity>} queryCommand Query command.
     * 
     * @returns {Promise<Nullable<TEntity>>} Entity or null.
     */
    public async executeQueryCommand<TEntity extends Entity>(queryCommand: QueryCommand<TEntity>): Promise<Nullable<TEntity>>
    {
        const keyValue = first(queryCommand.keyValues);

        if (isNil(keyValue)) 
        {
            return null;
        }
        
        const typeMetadata = queryCommand.entityInfo.typeMetadata;
        const resourceIdentifier = toString(keyValue);
        const linkObject = this.jsonApiAdapter.createResourceIdentifierQueryLinkObject(typeMetadata, resourceIdentifier, queryCommand);
        const responseDocumentObject = await this.jsonApiConnection.get(linkObject);
        const responseEntity = this.jsonApiAdapter.createDocumentObjectEntity(typeMetadata, responseDocumentObject);

        if (isNil(responseEntity))
        {
            return null;
        }

        return responseEntity;
    }

    /**
     * Executes bulk query command.
     * 
     * @param {BulkQueryCommand<TEntity>} bulkQueryCommand Bulk query command.
     * 
     * @returns {Promise<PaginatedEntityCollection<TEntity>>} Queried entity collection.
     */
    public async executeBulkQueryCommand<TEntity extends Entity>(bulkQueryCommand: BulkQueryCommand<TEntity>): Promise<PaginatedEntityCollection<TEntity>>
    {
        const typeMetadata = bulkQueryCommand.entityInfo.typeMetadata;
        const linkObject = this.jsonApiAdapter.createResourceBrowseLinkObject(typeMetadata, bulkQueryCommand);
        const responseDocumentObject = await this.jsonApiConnection.get(linkObject);
        const responseEntityCollection = this.jsonApiAdapter.createDocumentObjectPaginatedEntityCollection(typeMetadata, responseDocumentObject);
        
        return responseEntityCollection;
    }

    /**
     * Executes remove command.
     * 
     * @param {RemoveCommand<TEntity>} removeCommand Remove command.
     * 
     * @returns {Promise<TEntity>} Removed entity.
     */
    public async executeRemoveCommand<TEntity extends Entity>(removeCommand: RemoveCommand<TEntity>): Promise<TEntity>
    {
        const typeMetadata = removeCommand.entityInfo.typeMetadata;
        const requestEntity = removeCommand.entity;
        const linkObject = this.jsonApiAdapter.createResourceIdentifierLinkObject(typeMetadata, requestEntity);

        await this.jsonApiConnection.delete(linkObject, {});

        return requestEntity;
    }

    /**
     * Executes bulk remove command.
     * 
     * @param {BulkRemoveCommand<TEntity>} bulkRemoveCommand Bulk remove command.
     * 
     * @returns {Promise<EntityCollection<TEntity>>} Removed entity collection.
     */
    public async executeBulkRemoveCommand<TEntity extends Entity>(bulkRemoveCommand: BulkRemoveCommand<TEntity>): Promise<EntityCollection<TEntity>>
    {
        const entityInfo = bulkRemoveCommand.entityInfo;
        const requestEntityCollection = bulkRemoveCommand.entityCollection;
        const responseEntityPromises = new Array<Promise<TEntity>>();

        for (const requestEntity of requestEntityCollection) 
        {
            const removeCommand = new RemoveCommand<TEntity>(entityInfo, requestEntity);
            const responseEntityPromise = this.executeRemoveCommand(removeCommand);

            responseEntityPromises.push(responseEntityPromise);
        }

        const responseEntities = await Promise.all(responseEntityPromises);
        const responseEntityCollection = new EntityCollection<TEntity>(responseEntities);

        return responseEntityCollection;
    }
    
    /**
     * Executes batch remove command.
     * 
     * @param {BatchRemoveCommand<TEntity>} batchRemoveCommand Batch remove command.
     * 
     * @returns {Promise<void>} Promise to remove an entity collection.
     */
    public async executeBatchRemoveCommand<TEntity extends Entity>(batchRemoveCommand: BatchRemoveCommand<TEntity>): Promise<void>
    {
        throw new CommandNotSupportedError(batchRemoveCommand, this);
    }

    /**
     * Creates json api to many relationship.
     * 
     * @param {EntitySet<TEntity>} entitySet Entity set.
     * @param {TEntity} entity Entity.
     * @param {IncludeCollectionClause<TEntity, TRelationship>} includeCollectionClause Include collection clause.
     * 
     * @returns {JsonApiToManyRelationship<TEntity, TRelationship>} Json api to many relationship for provided entity.
     */
    public createJsonApiToManyRelationship<TEntity extends Entity, TRelationship extends Entity>(entitySet: EntitySet<TEntity>, entity: TEntity, includeCollectionClause: IncludeCollectionClause<TEntity, TRelationship>): JsonApiToManyRelationship<TEntity, TRelationship>
    {
        const browseCommand = entitySet.includeCollection(includeCollectionClause).build();
        const includeExpression = browseCommand.includeExpression!;
        const propertyInfo = includeExpression.propertyInfo;

        return new JsonApiToManyRelationship<TEntity, TRelationship>(this, entitySet, entity, propertyInfo);
    }

    /**
     * Creates json api to one relationship.
     * 
     * @param {EntitySet<TEntity>} entitySet Entity set.
     * @param {TEntity} entity Entity.
     * @param {IncludeClause<TEntity, TRelationship>} includeClause Include clause.
     * 
     * @returns {JsonApiToManyRelationship<TEntity, TRelationship>} Json api to many relationship for provided entity.
     */
    public createJsonApiToOneRelationship<TEntity extends Entity, TRelationship extends Entity>(entitySet: EntitySet<TEntity>, entity: TEntity, includeClause: IncludeClause<TEntity, TRelationship>): JsonApiToOneRelationship<TEntity, TRelationship>
    {
        const browseCommand = entitySet.include(includeClause).build();
        const includeExpression = browseCommand.includeExpression!;
        const propertyInfo = includeExpression.propertyInfo;
        
        return new JsonApiToOneRelationship<TEntity, TRelationship>(this, entitySet, entity, propertyInfo);
    }
}
