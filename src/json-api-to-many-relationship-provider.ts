import { Entity, EntityCollection, EntityProvider, Nullable } from '@dipscope/entity-store';
import { AddCommand, BatchRemoveCommand, BatchUpdateCommand, CommandNotSupportedError, PaginatedEntityCollection } from '@dipscope/entity-store';
import { BulkAddCommand, BulkQueryCommand, BulkRemoveCommand, BulkSaveCommand } from '@dipscope/entity-store';
import { BulkUpdateCommand, QueryCommand, RemoveCommand, SaveCommand, UpdateCommand } from '@dipscope/entity-store';
import { PropertyMetadata, TypeMetadata } from '@dipscope/type-manager';
import { JsonApiAdapter } from './json-api-adapter';
import { JsonApiConnection } from './json-api-connection';

/**
 * Json api to many relationship provider.
 * 
 * @type {JsonApiToManyRelationshipProvider}
 */
export class JsonApiToManyRelationshipProvider implements EntityProvider
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
     * Type metadata of entity.
     * 
     * @type {TypeMetadata<any>}
     */
    public readonly typeMetadata: TypeMetadata<any>;

    /**
     * Root entity.
     * 
     * @type {Entity}
     */
    public readonly entity: Entity;

    /**
     * Property metadata.
     * 
     * @type {PropertyMetadata<any, any>}
     */
    public readonly propertyMetadata: PropertyMetadata<any, any>;
    
    /**
     * Constructor.
     * 
     * @param {JsonApiConnection} jsonApiConnection Connection to json api.
     * @param {JsonApiAdapter} jsonApiAdapter Json api adapter to transform entities to propper document objects and back.
     * @param {TypeMetadata<any>} typeMetadata Type metadata.
     * @param {Entity} entity Root entity.
     * @param {PropertyMetadata<any, any>} propertyMetadata Property metadata.
     */
    public constructor(
        jsonApiConnection: JsonApiConnection, 
        jsonApiAdapter: JsonApiAdapter,
        typeMetadata: TypeMetadata<any>,
        entity: Entity,
        propertyMetadata: PropertyMetadata<any, any>
    )
    {
        this.jsonApiConnection = jsonApiConnection;
        this.jsonApiAdapter = jsonApiAdapter;
        this.typeMetadata = typeMetadata;
        this.entity = entity;
        this.propertyMetadata = propertyMetadata;

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
        const requestEntityCollection = new EntityCollection<TEntity>([requestEntity]);
        const requestRelationshipObject = this.jsonApiAdapter.createEntityCollectionRelationshipObject(typeMetadata, requestEntityCollection);
        const linkObject = this.jsonApiAdapter.createRelationshipLinkObject(this.typeMetadata, this.entity, this.propertyMetadata);

        await this.jsonApiConnection.post(linkObject, requestRelationshipObject);

        return requestEntity;
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
        const typeMetadata = bulkAddCommand.entityInfo.typeMetadata;
        const requestEntityCollection = bulkAddCommand.entityCollection;
        const requestRelationshipObject = this.jsonApiAdapter.createEntityCollectionRelationshipObject(typeMetadata, requestEntityCollection);
        const linkObject = this.jsonApiAdapter.createRelationshipLinkObject(this.typeMetadata, this.entity, this.propertyMetadata);

        await this.jsonApiConnection.post(linkObject, requestRelationshipObject);

        return requestEntityCollection;
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
        const requestEntityCollection = new EntityCollection<TEntity>([requestEntity]);
        const requestRelationshipObject = this.jsonApiAdapter.createEntityCollectionRelationshipObject(typeMetadata, requestEntityCollection);
        const linkObject = this.jsonApiAdapter.createRelationshipLinkObject(this.typeMetadata, this.entity, this.propertyMetadata);

        await this.jsonApiConnection.patch(linkObject, requestRelationshipObject);

        return requestEntity;
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
        const typeMetadata = bulkUpdateCommand.entityInfo.typeMetadata;
        const requestEntityCollection = bulkUpdateCommand.entityCollection;
        const requestRelationshipObject = this.jsonApiAdapter.createEntityCollectionRelationshipObject(typeMetadata, requestEntityCollection);
        const linkObject = this.jsonApiAdapter.createRelationshipLinkObject(this.typeMetadata, this.entity, this.propertyMetadata);

        await this.jsonApiConnection.patch(linkObject, requestRelationshipObject);

        return requestEntityCollection;
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
        const typeMetadata = saveCommand.entityInfo.typeMetadata;
        const requestEntity = saveCommand.entity;
        const requestRelationshipObject = this.jsonApiAdapter.createEntityDocumentObject(typeMetadata, requestEntity);
        const linkObject = this.jsonApiAdapter.createRelationshipLinkObject(this.typeMetadata, this.entity, this.propertyMetadata, "");

        await this.jsonApiConnection.post(linkObject, requestRelationshipObject);

        return requestEntity;
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
        const typeMetadata = bulkSaveCommand.entityInfo.typeMetadata;
        const requestEntityCollection = bulkSaveCommand.entityCollection;
        const requestDocumentCollection = requestEntityCollection.map(el => this.jsonApiAdapter.createEntityDocumentObject(typeMetadata, el))
        const linkObject = this.jsonApiAdapter.createRelationshipLinkObject(this.typeMetadata, this.entity, this.propertyMetadata, "");

        await Promise.all(requestDocumentCollection.map(el => this.jsonApiConnection.post(linkObject, el)));

        return requestEntityCollection;
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
        throw new CommandNotSupportedError(queryCommand, this);
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
        const linkObject = this.jsonApiAdapter.createRelationshipBrowseLinkObject(this.typeMetadata, this.entity, this.propertyMetadata, bulkQueryCommand);
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
        const requestEntityCollection = new EntityCollection<TEntity>([requestEntity]);
        const requestRelationshipObject = this.jsonApiAdapter.createEntityCollectionRelationshipObject(typeMetadata, requestEntityCollection);
        const linkObject = this.jsonApiAdapter.createRelationshipLinkObject(this.typeMetadata, this.entity, this.propertyMetadata);

        await this.jsonApiConnection.delete(linkObject, requestRelationshipObject);

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
        const typeMetadata = bulkRemoveCommand.entityInfo.typeMetadata;
        const requestEntityCollection = bulkRemoveCommand.entityCollection;
        const requestRelationshipObject = this.jsonApiAdapter.createEntityCollectionRelationshipObject(typeMetadata, requestEntityCollection);
        const linkObject = this.jsonApiAdapter.createRelationshipLinkObject(this.typeMetadata, this.entity, this.propertyMetadata);

        await this.jsonApiConnection.delete(linkObject, requestRelationshipObject);

        return requestEntityCollection;
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
}
