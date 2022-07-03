import first from 'lodash/first';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import merge from 'lodash/merge';
import toString from 'lodash/toString';
import { AddCommand, BatchRemoveCommand, BatchUpdateCommand, BrowseCommand } from '@dipscope/entity-store';
import { BulkAddCommand, BulkQueryCommand, BulkRemoveCommand, BulkSaveCommand } from '@dipscope/entity-store';
import { BulkUpdateCommand, QueryCommand, RemoveCommand, SaveCommand, UpdateCommand } from '@dipscope/entity-store';
import { Entity, EntityCollection, EntityProvider, Nullable } from '@dipscope/entity-store';
import { TypeMetadata } from '@dipscope/type-manager';
import { JsonApiNetFilterExpressionVisitor } from './filter-expression-visitors/json-api-net-filter-expression-visitor';
import { JsonApiAdapter } from './json-api-adapter';
import { JsonApiConnection } from './json-api-connection';
import { JsonApiEntityProviderOptions } from './json-api-entity-provider-options';
import { JsonApiFilterExpressionVisitor } from './json-api-filter-expression-visitor';
import { JsonApiIncludeExpressionVisitor } from './json-api-include-expression-visitor';
import { JsonApiPaginateExpressionVisitor } from './json-api-paginate-expression-visitor';
import { JsonApiSortExpressionVisitor } from './json-api-sort-expression-visitor';
import { OffsetBasedPaginateExpressionVisitor } from './paginate-expression-visitors/offset-based-paginate-expression-visitor';
import { LinkObject } from './types/link-object';

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
     * Filter expression visitor used to transform entity store commands.
     * 
     * @type {JsonApiFilterExpressionVisitor}
     */
    public readonly jsonApiFilterExpressionVisitor: JsonApiFilterExpressionVisitor;

    /**
     * Paginate expression visitor used to transform entity store commands.
     * 
     * @type {JsonApiPaginateExpressionVisitor}
     */
    public readonly jsonApiPaginateExpressionVisitor: JsonApiPaginateExpressionVisitor;

    /**
     * Sort expression visitor used to transform entity store commands.
     * 
     * @type {JsonApiSortExpressionVisitor}
     */
    public readonly jsonApiSortExpressionVisitor: JsonApiSortExpressionVisitor;
    
    /**
     * Include expression visitor used to transform entity store commands.
     * 
     * @type {JsonApiIncludeExpressionVisitor}
     */
    public readonly jsonApiIncludeExpressionVisitor: JsonApiIncludeExpressionVisitor;

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
        const jsonApiRequestInterceptor = jsonApiEntityProviderOptions.jsonApiRequestInterceptor ?? defaultJsonApiRequestInterceptor;

        this.jsonApiConnection = new JsonApiConnection(jsonApiEntityProviderOptions.baseUrl, jsonApiRequestInterceptor);
        this.jsonApiFilterExpressionVisitor = jsonApiEntityProviderOptions.jsonApiFilterExpressionVisitor ?? new JsonApiNetFilterExpressionVisitor();
        this.jsonApiPaginateExpressionVisitor = jsonApiEntityProviderOptions.jsonApiPaginateExpressionVisitor ?? new OffsetBasedPaginateExpressionVisitor();
        this.jsonApiSortExpressionVisitor = new JsonApiSortExpressionVisitor();
        this.jsonApiIncludeExpressionVisitor = new JsonApiIncludeExpressionVisitor();
        this.jsonApiAdapter = new JsonApiAdapter(jsonApiEntityProviderOptions.allowToManyRelationshipReplacement ?? false);
        
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
        const linkObject = this.createResourceLinkObject(typeMetadata);
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
        const linkObject = this.createResourceIdentifierLinkObject(typeMetadata, requestEntity);
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
    public executeBatchUpdateCommand<TEntity extends Entity>(batchUpdateCommand: BatchUpdateCommand<TEntity>): Promise<void>
    {
        throw new Error('Not supported');
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
        const resourceIdentifier = this.extractResourceIdentifier(entityInfo.typeMetadata, entity);

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
        const linkObject = this.createResourceIdentifierLinkObject(typeMetadata, resourceIdentifier);
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
     * @returns {Promise<EntityCollection<TEntity>>} Queried entity collection.
     */
    public async executeBulkQueryCommand<TEntity extends Entity>(bulkQueryCommand: BulkQueryCommand<TEntity>): Promise<EntityCollection<TEntity>>
    {
        const typeMetadata = bulkQueryCommand.entityInfo.typeMetadata;
        const linkObject = this.createResourceBrowseLinkObject(typeMetadata, bulkQueryCommand);
        const responseDocumentObject = await this.jsonApiConnection.get(linkObject);
        const responseEntityCollection = this.jsonApiAdapter.createDocumentObjectEntityCollection(typeMetadata, responseDocumentObject);

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
        const linkObject = this.createResourceIdentifierLinkObject(typeMetadata, requestEntity);

        await this.jsonApiConnection.delete(linkObject);

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
    public executeBatchRemoveCommand<TEntity extends Entity>(batchRemoveCommand: BatchRemoveCommand<TEntity>): Promise<void>
    {
        throw new Error('Not supported');
    }

    /**
     * Creates resource link object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     *  
     * @returns {LinkObject} Link object.
     */
    protected createResourceLinkObject<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>): LinkObject
    {
        const jsonApiResourceMetadata = this.jsonApiAdapter.extractJsonApiResourceMetadataOrFail(typeMetadata);
        const linkObject = `${this.jsonApiConnection.baseUrl}/${jsonApiResourceMetadata.type}`;

        return linkObject;
    }
    
    /**
     * Creates resource identifier link object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {TEntity} entity Entity.
     * 
     * @returns {LinkObject} Link object.
     */
    protected createResourceIdentifierLinkObject<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, entity: TEntity): LinkObject;
    protected createResourceIdentifierLinkObject<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, identifier: string): LinkObject;
    protected createResourceIdentifierLinkObject<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, entityOrIdentifier: TEntity | string): LinkObject
    {
        const resourceIdentifier = isString(entityOrIdentifier) ? entityOrIdentifier : toString(this.extractResourceIdentifier(typeMetadata, entityOrIdentifier));
        const linkObject = `${this.createResourceLinkObject(typeMetadata)}/${resourceIdentifier}`;

        return linkObject;
    }

    /**
     * Extracts resource identifier.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {TEntity} entity Entity to extract identifier for.
     * 
     * @returns {string|undefined} Resource identifier.
     */
    protected extractResourceIdentifier<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, entity: TEntity): string | undefined
    {
        const jsonApiResourceMetadata = this.jsonApiAdapter.extractJsonApiResourceMetadataOrFail(typeMetadata);
        const resourceIdentifier = entity[jsonApiResourceMetadata.id];

        if (isNil(resourceIdentifier))
        {
            return undefined;
        }

        return toString(resourceIdentifier);
    }

    /**
     * Creates resource browse link object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {BrowseCommand<any, any>} browseCommand Browse command.
     * 
     * @returns {LinkObject} Link object.
     */
    protected createResourceBrowseLinkObject<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, browseCommand: BrowseCommand<any, any>): LinkObject
    {
        let linkObject = this.createResourceLinkObject(typeMetadata);

        if (!isNil(browseCommand.filterExpression))
        {
            const symbol = '?';
            const filterPrefix = this.jsonApiFilterExpressionVisitor.prefix;
            const filterQuery = browseCommand.filterExpression.accept(this.jsonApiFilterExpressionVisitor);

            linkObject += `${symbol}${filterPrefix}${filterQuery}`;
        }

        if (!isNil(browseCommand.sortExpression))
        {
            const symbol = isNil(browseCommand.filterExpression) ? '?' : '&';
            const sortPrefix = this.jsonApiSortExpressionVisitor.prefix;
            const sortQuery = browseCommand.sortExpression.accept(this.jsonApiSortExpressionVisitor);

            linkObject += `${symbol}${sortPrefix}${sortQuery}`;
        }

        if (!isNil(browseCommand.includeExpression))
        {
            const symbol = isNil(browseCommand.filterExpression) && isNil(browseCommand.sortExpression) ? '?' : '&';
            const includePrefix = this.jsonApiIncludeExpressionVisitor.prefix;
            const includeQuery = browseCommand.includeExpression.accept(this.jsonApiIncludeExpressionVisitor);

            linkObject += `${symbol}${includePrefix}${includeQuery}`;
        }

        if (!isNil(browseCommand.paginateExpression))
        {
            const symbol = isNil(browseCommand.filterExpression) && isNil(browseCommand.sortExpression) && isNil(browseCommand.includeExpression) ? '?' : '&';
            const pagePrefix = this.jsonApiPaginateExpressionVisitor.prefix;
            const pageQuery = browseCommand.paginateExpression.accept(this.jsonApiPaginateExpressionVisitor);

            linkObject += `${symbol}${pagePrefix}${pageQuery}`;
        }
        
        return linkObject;
    }
}
