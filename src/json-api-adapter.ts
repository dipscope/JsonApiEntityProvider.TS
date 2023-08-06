import { isArray, isEmpty, isNil, isNull, isString, isUndefined, toNumber, toString } from 'lodash';
import { BrowseCommand, Entity, EntityCollection, Nullable, QueryCommand } from '@dipscope/entity-store';
import { PropertyMetadata, TypeMetadata } from '@dipscope/type-manager';
import { JsonApiConnection } from './json-api-connection';
import { JsonApiFilterExpressionVisitor } from './json-api-filter-expression-visitor';
import { JsonApiIncludeExpressionVisitor } from './json-api-include-expression-visitor';
import { JsonApiMetadataExtractor } from './json-api-metadata-extractor';
import { JsonApiPaginateExpressionVisitor } from './json-api-paginate-expression-visitor';
import { JsonApiPaginatedEntityCollection } from './json-api-paginated-entity-collection';
import { JsonApiResourceManager } from './json-api-resource-manager';
import { JsonApiResourceMetadata } from './json-api-resource-metadata';
import { JsonApiResourceMetadataNotFoundError } from './json-api-resource-metadata-not-found-error';
import { JsonApiSortExpressionVisitor } from './json-api-sort-expression-visitor';
import { AttributesObject } from './types/attributes-object';
import { DocumentObject } from './types/document-object';
import { LinkObject } from './types/link-object';
import { RelationshipObject } from './types/relationship-object';
import { RelationshipsObject } from './types/relationships-object';
import { ResourceIdentifierObject } from './types/resource-identifier-object';
import { ResourceObject } from './types/resource-object';

/**
 * Represents json api adapter to build document and link objects from entities and back.
 * 
 * @type {JsonApiAdapter}
 */
export class JsonApiAdapter
{
    /**
     * Json api connection.
     * 
     * @type {JsonApiConnection}
     */
    public readonly jsonApiConnection: JsonApiConnection;
    
    /**
     * Metadata extractor to related info.
     * 
     * @type {JsonApiMetadataExtractor}
     */
    public readonly jsonApiMetadataExtractor: JsonApiMetadataExtractor;

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
     * Allow to many relationship replacement?
     * 
     * @type {boolean}
     */
    public readonly allowToManyRelationshipReplacement: boolean;
    
    /**
     * Constructor.
     * 
     * @param {JsonApiConnection} jsonApiConnection Json api connection.
     * @param {JsonApiMetadataExtractor} jsonApiMetadataExtractor Json api metadata extractor.
     * @param {JsonApiFilterExpressionVisitor} jsonApiFilterExpressionVisitor Json api filter expression visitor.
     * @param {JsonApiPaginateExpressionVisitor} jsonApiPaginateExpressionVisitor Json api paginate expression visitor.
     * @param {JsonApiSortExpressionVisitor} jsonApiSortExpressionVisitor Json api sort expression visitor.
     * @param {JsonApiIncludeExpressionVisitor} jsonApiIncludeExpressionVisitor Json api include expression visitor.
     * @param {boolean} allowToManyRelationshipReplacement Allow to many relationship replacement?
     */
    public constructor(
        jsonApiConnection: JsonApiConnection, 
        jsonApiMetadataExtractor: JsonApiMetadataExtractor,
        jsonApiFilterExpressionVisitor: JsonApiFilterExpressionVisitor,
        jsonApiPaginateExpressionVisitor: JsonApiPaginateExpressionVisitor,
        jsonApiSortExpressionVisitor: JsonApiSortExpressionVisitor,
        jsonApiIncludeExpressionVisitor: JsonApiIncludeExpressionVisitor,
        allowToManyRelationshipReplacement: boolean
    )
    {
        this.jsonApiConnection = jsonApiConnection;
        this.jsonApiMetadataExtractor = jsonApiMetadataExtractor;
        this.jsonApiFilterExpressionVisitor = jsonApiFilterExpressionVisitor;
        this.jsonApiPaginateExpressionVisitor = jsonApiPaginateExpressionVisitor;
        this.jsonApiSortExpressionVisitor = jsonApiSortExpressionVisitor;
        this.jsonApiIncludeExpressionVisitor = jsonApiIncludeExpressionVisitor;
        this.allowToManyRelationshipReplacement = allowToManyRelationshipReplacement;

        return;
    }

    /**
     * Extracts json api resource metadata or throws an error.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * 
     * @returns {JsonApiResourceMetadata<TEntity>} Json api resource metadata.
     */
    private extractJsonApiResourceMetadataOrFail<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>): JsonApiResourceMetadata<TEntity>
    {
        const jsonApiResourceMetadata = this.extractJsonApiResourceMetadata(typeMetadata);

        if (isNil(jsonApiResourceMetadata))
        {
            throw new JsonApiResourceMetadataNotFoundError(typeMetadata);
        }

        return jsonApiResourceMetadata;
    }

    /**
     * Extracts json api resource metadata.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * 
     * @returns {JsonApiResourceMetadata<TEntity>|undefined} Json api resource metadata or undefined if metadata is not present.
     */
    private extractJsonApiResourceMetadata<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>): JsonApiResourceMetadata<TEntity> | undefined
    {
        const jsonApiResourceMetadata = JsonApiResourceManager.extractJsonApiResourceMetadataFromTypeMetadata(typeMetadata);

        return jsonApiResourceMetadata;
    }

    /**
     * Extracts resource identifier.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {TEntity} entity Entity to extract identifier for.
     * 
     * @returns {string|undefined} Resource identifier.
     */
    public extractResourceIdentifier<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, entity: TEntity): string | undefined
    {
        const jsonApiResourceMetadata = this.extractJsonApiResourceMetadataOrFail(typeMetadata);
        const resourceIdentifier = entity[jsonApiResourceMetadata.id];

        if (isNil(resourceIdentifier))
        {
            return undefined;
        }

        return toString(resourceIdentifier);
    }

    /**
     * Creates resource link object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     *  
     * @returns {LinkObject} Link object.
     */
    public createResourceLinkObject<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>): LinkObject
    {
        const jsonApiResourceMetadata = this.extractJsonApiResourceMetadataOrFail(typeMetadata);
        const linkObject = `${this.jsonApiConnection.baseUrl}/${jsonApiResourceMetadata.route}`;

        return linkObject;
    }

    /**
     * Creates resource identifier link object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {TEntity|string} entityOrIdentifier Entity or identifier.
     * 
     * @returns {LinkObject} Link object.
     */
    public createResourceIdentifierLinkObject<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, entityOrIdentifier: TEntity | string): LinkObject
    {
        const resourceLinkObject = this.createResourceLinkObject(typeMetadata);
        const resourceIdentifier = isString(entityOrIdentifier) ? entityOrIdentifier : toString(this.extractResourceIdentifier(typeMetadata, entityOrIdentifier));
        const linkObject = `${resourceLinkObject}/${resourceIdentifier}`;

        return linkObject;
    }

    /**
     * Creates relationship link object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {TEntity|string} entityOrIdentifier Entity or identifier.
     * @param {PropertyMetadata<TEntity, TRelationship>} propertyMetadata Property metadata.
     * 
     * @returns {LinkObject} Link object.
     */
    public createRelationshipLinkObject<TEntity extends Entity, TRelationship extends Entity>(typeMetadata: TypeMetadata<TEntity>, entityOrIdentifier: TEntity | string, propertyMetadata: PropertyMetadata<TEntity, TRelationship>): LinkObject
    {
        const resourceIdentifierLinkObject = this.createResourceIdentifierLinkObject(typeMetadata, entityOrIdentifier);
        const relationship = propertyMetadata.serializedPropertyName;
        const linkObject = `${resourceIdentifierLinkObject}/relationships/${relationship}`;
        
        return linkObject;
    }

    /**
     * Creates resource identifier query link object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {TEntity|string} entityOrIdentifier Entity or identifier.
     * @param {QueryCommand<TEntity>} queryCommand Query command.
     * 
     * @returns {LinkObject} Link object.
     */
    public createResourceIdentifierQueryLinkObject<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, entityOrIdentifier: TEntity | string, queryCommand: QueryCommand<TEntity>): LinkObject
    {
        const resourceIdentifierLinkObject = this.createResourceIdentifierLinkObject(typeMetadata, entityOrIdentifier);
        const linkObject = this.createQueryLinkObject(resourceIdentifierLinkObject, queryCommand);

        return linkObject;
    }

    /**
     * Creates relationship query link object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {TEntity|string} entityOrIdentifier Entity or identifier.
     * @param {PropertyMetadata<TEntity, TRelationship>} propertyMetadata Property metadata.
     * @param {QueryCommand<TEntity>} queryCommand Query command.
     * 
     * @returns {LinkObject} Link object.
     */
    public createRelationshipQueryLinkObject<TEntity extends Entity, TRelationship extends Entity>(typeMetadata: TypeMetadata<TEntity>, entityOrIdentifier: TEntity | string, propertyMetadata: PropertyMetadata<TEntity, TRelationship>, queryCommand: QueryCommand<TEntity>): LinkObject
    {
        const relationshipLinkObject = this.createRelationshipLinkObject(typeMetadata, entityOrIdentifier, propertyMetadata);
        const linkObject = this.createQueryLinkObject(relationshipLinkObject, queryCommand);

        return linkObject;
    }

    /**
     * Creates query link object.
     * 
     * @param {LinkObject} baseLinkObject Base link object.
     * @param {QueryCommand<TEntity>} queryCommand Query command.
     * 
     * @returns {LinkObject} Link object.
     */
    private createQueryLinkObject<TEntity extends Entity>(baseLinkObject: LinkObject, queryCommand: QueryCommand<TEntity>): LinkObject
    {
        let linkObject = baseLinkObject;

        if (!isNil(queryCommand.includeExpression))
        {
            const symbol = '?';
            const includePrefix = this.jsonApiIncludeExpressionVisitor.prefix;
            const includeQuery = queryCommand.includeExpression.accept(this.jsonApiIncludeExpressionVisitor);

            linkObject += `${symbol}${includePrefix}${includeQuery}`;
        }

        return linkObject;
    }

    /**
     * Creates resource browse link object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {BrowseCommand<any, any>} browseCommand Browse command.
     * 
     * @returns {LinkObject} Link object.
     */
    public createResourceBrowseLinkObject<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, browseCommand: BrowseCommand<any, any>): LinkObject
    {
        const resourceLinkObject = this.createResourceLinkObject(typeMetadata);
        const linkObject = this.createBrowseLinkObject(resourceLinkObject, browseCommand);

        return linkObject;
    }

    /**
     * Creates relationship browse link object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {TEntity|string} entityOrIdentifier Entity or identifier.
     * @param {PropertyMetadata<TEntity, TRelationship>} propertyMetadata Property metadata.
     * @param {BrowseCommand<TEntity, any>} browseCommand Browse command.
     * 
     * @returns {LinkObject} Link object.
     */
    public createRelationshipBrowseLinkObject<TEntity extends Entity, TRelationship extends Entity>(typeMetadata: TypeMetadata<TEntity>, entityOrIdentifier: TEntity | string, propertyMetadata: PropertyMetadata<TEntity, TRelationship>, browseCommand: BrowseCommand<TEntity, any>): LinkObject
    {
        const relationshipLinkObject = this.createRelationshipLinkObject(typeMetadata, entityOrIdentifier, propertyMetadata);
        const linkObject = this.createBrowseLinkObject(relationshipLinkObject, browseCommand);

        return linkObject;
    }

    /**
     * Creates browse link object.
     * 
     * @param {LinkObject} baseLinkObject Base link object.
     * @param {BrowseCommand<TEntity, any>} browseCommand Browse command.
     * 
     * @returns {LinkObject} Link object.
     */
    private createBrowseLinkObject<TEntity extends Entity>(baseLinkObject: LinkObject, browseCommand: BrowseCommand<TEntity, any>): LinkObject
    {
        let linkObject = baseLinkObject;

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

    /**
     * Creates entity relationship object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {Nullable<TEntity>} entity Entity.
     * 
     * @returns {RelationshipObject} Relationship object created from entity.
     */
    public createEntityRelationshipObject<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, entity: Nullable<TEntity>): RelationshipObject
    {
        const jsonApiResourceMetadata = this.extractJsonApiResourceMetadataOrFail(typeMetadata);
        const serializerContext = typeMetadata.typeManager.defineSerializerContext(typeMetadata.typeFn, entity);
        const serializedEntity = serializerContext.serialize(entity);
        const relationshipObject = this.createValueRelationshipObject(jsonApiResourceMetadata, serializedEntity);

        return relationshipObject;
    }

    /**
     * Creates entity collection relationship object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {EntityCollection<TEntity>} entityCollection Entity collection.
     * 
     * @returns {RelationshipObject} Relationship object created from entity collection.
     */
    public createEntityCollectionRelationshipObject<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, entityCollection: EntityCollection<TEntity>): RelationshipObject
    {
        const jsonApiResourceMetadata = this.extractJsonApiResourceMetadataOrFail(typeMetadata);
        const serializerContext = typeMetadata.typeManager.defineSerializerContext(EntityCollection, entityCollection, [typeMetadata.typeFn]);
        const serializedEntityCollection = serializerContext.serialize(entityCollection);
        const relationshipObject = this.createValueRelationshipObject(jsonApiResourceMetadata, serializedEntityCollection);

        return relationshipObject;
    }

    /**
     * Creates document object from entity.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {Nullable<TEntity>} entity Entity.
     * 
     * @returns {DocumentObject} Document object created from entity.
     */
    public createEntityDocumentObject<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, entity: Nullable<TEntity>): DocumentObject
    {
        const resourceObject = isNil(entity) ? null : this.createEntityResourceObject(typeMetadata, entity);
        const documentObject = { data: resourceObject } as DocumentObject;

        return documentObject;
    }

    /**
     * Creates document object from entity collection.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {EntityCollection<TEntity>} entityCollection Entity collection.
     * 
     * @returns {DocumentObject} Document object created from entity collection.
     */
    public createEntityCollectionDocumentObject<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, entityCollection: EntityCollection<TEntity>): DocumentObject
    {
        const resourceObjects = new Array<ResourceObject>();
        const documentObject = { data: resourceObjects } as DocumentObject;

        for (const entity of entityCollection)
        {
            const resourceObject = this.createEntityResourceObject(typeMetadata, entity);

            resourceObjects.push(resourceObject);
        }

        return documentObject;
    }

    /**
     * Creates a resource object from an entity.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata of an entity.
     * @param {TEntity} entity Entity.
     * 
     * @returns {ResourceObject} Resource object created from an entity.
     */
    private createEntityResourceObject<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, entity: TEntity): ResourceObject
    {
        const serializerContext = typeMetadata.typeManager.defineSerializerContext(typeMetadata.typeFn, entity);
        const serializedEntity = serializerContext.serialize(entity);
        const resourceObject = this.createSerializedEntityResourceObject(typeMetadata, serializedEntity);

        return resourceObject;
    }

    /**
     * Creates resource object from serialized entity.
     * 
     * @param {TypeMetadata<Entity>} typeMetadata Entity type metadata.
     * @param {Entity} serializedEntity Serialized entity.
     * 
     * @returns {ResourceObject} Resource object created from serialized entity.
     */
    private createSerializedEntityResourceObject<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, serializedEntity: Entity): ResourceObject
    {
        const jsonApiResourceMetadata = this.extractJsonApiResourceMetadataOrFail(typeMetadata);
        const resourceObject = { type: jsonApiResourceMetadata.type } as ResourceObject;
        const attributesObject = {} as AttributesObject;
        const relationshipsObject = {} as RelationshipsObject;

        for (const propertyMetadata of typeMetadata.propertyMetadataMap.values())
        {
            if (propertyMetadata.serializationConfigured && !propertyMetadata.serializable)
            {
                continue;
            }

            const serializedPropertyName = propertyMetadata.serializedPropertyName;
            const propertyValue = serializedEntity[serializedPropertyName];

            if (isUndefined(propertyValue))
            {
                continue;
            }

            if (serializedPropertyName === jsonApiResourceMetadata.id)
            {
                resourceObject.id = toString(propertyValue);

                continue;
            }

            const relationshipTypeMetadata = this.extractRelationshipTypeMetadata(propertyMetadata);
            const relationshipJsonApiResourceMetadata = this.extractJsonApiResourceMetadata(relationshipTypeMetadata);

            if (isNil(relationshipJsonApiResourceMetadata))
            {
                attributesObject[serializedPropertyName] = propertyValue;

                continue;
            }

            const relationshipObject = this.createValueRelationshipObject(relationshipJsonApiResourceMetadata, propertyValue);

            if (isArray(relationshipObject.data) && !this.allowToManyRelationshipReplacement)
            {
                continue;
            }

            relationshipsObject[serializedPropertyName] = relationshipObject;
        }

        if (!isEmpty(attributesObject)) 
        {
            resourceObject.attributes = attributesObject;
        }

        if (!isEmpty(relationshipsObject)) 
        {
            resourceObject.relationships = relationshipsObject;
        }

        return resourceObject;
    }

    /**
     * Extracts relationship type metadata.
     * 
     * @param {PropertyMetadata<TEntity, any>} propertyMetadata Property metadata.
     * 
     * @returns {TypeMetadata<any>} Type metadata of relationship.
     */
    private extractRelationshipTypeMetadata<TEntity extends Entity>(propertyMetadata: PropertyMetadata<TEntity, any>): TypeMetadata<any>
    {
        const propertyTypeMetadata = propertyMetadata.typeMetadata;
        const propertyTypeFn = propertyTypeMetadata.typeFn;

        if (propertyTypeFn !== Array && propertyTypeFn !== EntityCollection)
        {
            return propertyTypeMetadata;
        }

        const collectionGenericMetadatas = propertyMetadata.genericMetadatas;

        if (isNil(collectionGenericMetadatas) || isEmpty(collectionGenericMetadatas))
        {
            return propertyTypeMetadata;
        }

        const relationshipTypeMetadata = collectionGenericMetadatas[0][0] as TypeMetadata<any>;

        return relationshipTypeMetadata;
    }

    /**
     * Creates relationship object from provided value.
     * 
     * @param {JsonApiResourceMetadata<TEntity>} jsonApiResourceMetadata Json api resource metadata.
     * @param {undefined|Nullable<Entity>|Array<Entity>} value Relationship value.
     * 
     * @returns {RelationshipObject} Relationship object created from value.
     */
    private createValueRelationshipObject<TEntity extends Entity>(jsonApiResourceMetadata: JsonApiResourceMetadata<TEntity>, value: undefined | Nullable<Entity> | Array<Entity>): RelationshipObject
    {
        const relationshipObject = { data: undefined } as RelationshipObject;

        if (isUndefined(value))
        {
            return relationshipObject;
        }

        if (isNull(value))
        {
            relationshipObject.data = null;

            return relationshipObject;
        }

        if (isArray(value))
        {
            relationshipObject.data = this.createSerializedEntityResourceIdentifierObjects(jsonApiResourceMetadata, value);

            return relationshipObject;
        }

        relationshipObject.data = this.createSerializedEntityResourceIdentifierObject(jsonApiResourceMetadata, value);

        return relationshipObject;
    }

    /**
     * Creates resource identifier objects from provided serialized entities.
     * 
     * @param {JsonApiResourceMetadata<TEntity>} jsonApiResourceMetadata Json api resource metadata.
     * @param {Array<Entity>} serializedEntities Serialized entities.
     * 
     * @returns {Array<ResourceIdentifierObject>} Resource identifier objects.
     */
    private createSerializedEntityResourceIdentifierObjects<TEntity extends Entity>(jsonApiResourceMetadata: JsonApiResourceMetadata<TEntity>, serializedEntities: Array<Entity>): Array<ResourceIdentifierObject>
    {
        const resourceIdentifierObjects = new Array<ResourceIdentifierObject>();

        for (const serializedEntity of serializedEntities)
        {
            const resourceIdentifierObject = this.createSerializedEntityResourceIdentifierObject(jsonApiResourceMetadata, serializedEntity);

            resourceIdentifierObjects.push(resourceIdentifierObject);
        }

        return resourceIdentifierObjects;
    }

    /**
     * Creates resource identifier object from provided serialized entity.
     * 
     * @param {JsonApiResourceMetadata<TEntity>} jsonApiResourceMetadata Json api resource metadata.
     * @param {Entity} serializedEntity Serialized entity.
     * 
     * @returns {ResourceIdentifierObject} Resource identifier object.
     */
    private createSerializedEntityResourceIdentifierObject<TEntity extends Entity>(jsonApiResourceMetadata: JsonApiResourceMetadata<TEntity>, serializedEntity: Entity): ResourceIdentifierObject
    {
        const resourceIdentifierObject = { type: jsonApiResourceMetadata.type, id: toString(serializedEntity[jsonApiResourceMetadata.id]) } as ResourceIdentifierObject;

        return resourceIdentifierObject;
    }

    /**
     * Creates entity from document object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {DocumentObject} documentObject Document object.
     * 
     * @returns {Nullable<TEntity>} Entity created from a document object.
     */
    public createDocumentObjectEntity<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, documentObject: DocumentObject): Nullable<TEntity>
    {
        const resourceObject = documentObject.data as ResourceObject;
        const includedResourceObjects = documentObject.included ?? new Array<ResourceObject>();
        const entity = isNil(resourceObject) ? null : this.createResourceObjectEntity(typeMetadata, resourceObject, includedResourceObjects);

        return entity;
    }

    /**
     * Creates paginated entity collection from a document object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {DocumentObject} documentObject Document object.
     * 
     * @returns {EntityCollection<TEntity>} Entity collection created from document object.
     */
    public createDocumentObjectPaginatedEntityCollection<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, documentObject: DocumentObject): JsonApiPaginatedEntityCollection<TEntity>
    {
        const entityCollection = this.createDocumentObjectEntityCollection(typeMetadata, documentObject);
        const totalLength = this.jsonApiMetadataExtractor.extractTotalEntityCount(documentObject);
        const links = documentObject.links ?? {};
        const firstLinkObject = links.first;
        const lastLinkObject = links.last;
        const nextLinkObject = links.next;
        const prevLinkObject = links.prev;
        const paginatedEntityCollection = new JsonApiPaginatedEntityCollection(entityCollection, typeMetadata, this, totalLength, firstLinkObject, lastLinkObject, nextLinkObject, prevLinkObject);

        return paginatedEntityCollection;
    }

    /**
     * Creates entity collection from a document object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {DocumentObject} documentObject Document object.
     * 
     * @returns {EntityCollection<TEntity>} Entity collection created from document object.
     */
    public createDocumentObjectEntityCollection<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, documentObject: DocumentObject): EntityCollection<TEntity>
    {
        const entityCollection = new EntityCollection<TEntity>();
        const resourceObjects = documentObject.data as Array<ResourceObject>;
        const relationshipResourceObjects = documentObject.included ?? new Array<ResourceObject>();

        for (const resourceObject of resourceObjects)
        {
            const entity = this.createResourceObjectEntity(typeMetadata, resourceObject, relationshipResourceObjects);

            entityCollection.push(entity);
        }

        return entityCollection;
    }
    
    /**
     * Creates entity from resource object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Entity type metadata.
     * @param {ResourceObject} resourceObject Resource object.
     * @param {Array<ResourceObject>} includedResourceObjects Included resource objects.
     * 
     * @returns {TEntity} Entity created from resource object.
     */
    private createResourceObjectEntity<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, resourceObject: ResourceObject, includedResourceObjects: Array<ResourceObject>): TEntity
    {
        const serializedEntity = this.createResourceObjectSerializedEntity(typeMetadata, resourceObject, includedResourceObjects);
        const serializerContext = typeMetadata.typeManager.defineSerializerContext(typeMetadata.typeFn, serializedEntity);
        const entity = serializerContext.deserialize(serializedEntity) as TEntity;
        
        return entity;
    }

    /**
     * Creates serialized entity from resource object.
     * 
     * @param {TypeMetadata<Entity>} typeMetadata Entity type metadata.
     * @param {ResourceObject} resourceObject Resource object.
     * @param {Array<ResourceObject>} includedResourceObjects Included resource objects.
     * 
     * @returns {Entity} Serialized entity created from resource object.
     */
    private createResourceObjectSerializedEntity<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, resourceObject: ResourceObject, includedResourceObjects: Array<ResourceObject>): Entity
    {
        const jsonApiResourceMetadata = this.extractJsonApiResourceMetadataOrFail(typeMetadata);
        const serializedEntity = {} as Entity;
        const attributes = resourceObject.attributes ?? {} as AttributesObject;
        const relationships = resourceObject.relationships ?? {} as RelationshipsObject;

        for (const propertyMetadata of typeMetadata.propertyMetadataMap.values())
        {
            if (propertyMetadata.serializationConfigured && !propertyMetadata.deserializable)
            {
                continue;
            }

            const serializedPropertyName = propertyMetadata.serializedPropertyName;
            
            if (serializedPropertyName === jsonApiResourceMetadata.id)
            {
                const numericId = propertyMetadata.typeMetadata.typeFn === Number;
                const id = numericId ? toNumber(resourceObject.id) : resourceObject.id;

                serializedEntity[jsonApiResourceMetadata.id] = id;

                continue;
            }

            if (isNil(relationships[serializedPropertyName]))
            {
                serializedEntity[serializedPropertyName] = attributes[serializedPropertyName];

                continue;
            }

            serializedEntity[serializedPropertyName] = this.createRelationshipObjectValue(propertyMetadata, relationships[serializedPropertyName], includedResourceObjects);
        }

        return serializedEntity;
    }

    /**
     * Creates relationship object value.
     * 
     * @param {PropertyMetadata<TEntity, any>} propertyMetadata Relationship property metadata.
     * @param {RelationshipObject} relationshipObject Relationship object.
     * @param {Array<ResourceObject>} includedResourceObjects Included resource objects.
     * 
     * @returns {undefined|Nullable<Entity>|Array<Entity>} Relationship value.
     */
    private createRelationshipObjectValue<TEntity extends Entity>(propertyMetadata: PropertyMetadata<TEntity, any>, relationshipObject: RelationshipObject, includedResourceObjects: Array<ResourceObject>): undefined | Nullable<Entity> | Array<Entity>
    {
        if (isUndefined(relationshipObject.data))
        {
            return undefined;
        }

        if (isNull(relationshipObject.data))
        {
            return null;
        }

        if (isArray(relationshipObject.data))
        {
            const value = this.createResourceIdentifierObjectSerializedEntities(propertyMetadata, relationshipObject.data, includedResourceObjects);

            return value;
        }

        const value = this.createResourceIdentifierObjectSerializedEntity(propertyMetadata, relationshipObject.data, includedResourceObjects);

        return value;
    }

    /**
     * Creates serialized entities from resource identifier objects.
     * 
     * @param {PropertyMetadata<TEntity, any>} propertyMetadata Relationship property metadata.
     * @param {Array<ResourceIdentifierObject>} resourceIdentifierObjects Resource identifier objects.
     * @param {Array<ResourceObject>} includedResourceObjects Included resource objects.
     * 
     * @returns {Array<Entity>} Serialized entities created from resource identifier objects.
     */
    private createResourceIdentifierObjectSerializedEntities<TEntity extends Entity>(propertyMetadata: PropertyMetadata<TEntity, any>, resourceIdentifierObjects: Array<ResourceIdentifierObject>, includedResourceObjects: Array<ResourceObject>): Array<Entity>
    {
        const serializedEntities = new Array<Entity>();
        const collectionGenericMetadatas = propertyMetadata.genericMetadatas;

        if (isNil(collectionGenericMetadatas) || isEmpty(collectionGenericMetadatas))
        {
            return serializedEntities;
        }

        const entityTypeMetadata = collectionGenericMetadatas[0][0] as TypeMetadata<any>;

        for (const resourceIdentifierObject of resourceIdentifierObjects)
        {
            const resourceObject = this.linkResourceObject(resourceIdentifierObject, includedResourceObjects);
            const serializedEntity = this.createResourceObjectSerializedEntity(entityTypeMetadata, resourceObject, includedResourceObjects);

            serializedEntities.push(serializedEntity);
        }

        return serializedEntities;
    }

    /**
     * Creates serialized entity from resource identifier object.
     * 
     * @param {PropertyMetadata<TEntity, any>} propertyMetadata Relationship property metadata.
     * @param {ResourceIdentifierObject} resourceIdentifierObject Resource identifier objects.
     * @param {Array<ResourceObject>} includedResourceObjects Included resource objects.
     * 
     * @returns {Entity} Serialized entity created from resource identifier object.
     */
    private createResourceIdentifierObjectSerializedEntity<TEntity extends Entity>(propertyMetadata: PropertyMetadata<TEntity, any>, resourceIdentifierObject: ResourceIdentifierObject, includedResourceObjects: Array<ResourceObject>): Entity
    {
        const resourceObject = this.linkResourceObject(resourceIdentifierObject, includedResourceObjects);
        const serializedEntity = this.createResourceObjectSerializedEntity(propertyMetadata.typeMetadata, resourceObject, includedResourceObjects);

        return serializedEntity;
    }
    
    /**
     * Links resource identifier object to included instance.
     * 
     * @param {ResourceIdentifierObject} resourceIdentifierObject Resource identifier object.
     * @param {Array<ResourceObject>} includedResourceObjects Included resource objects.
     * 
     * @returns {ResourceObject} Linked resource object.
     */
    private linkResourceObject(resourceIdentifierObject: ResourceIdentifierObject, includedResourceObjects: Array<ResourceObject>): ResourceObject
    {
        let resourceObject = resourceIdentifierObject as ResourceObject;

        for (const includedResourceObject of includedResourceObjects)
        {
            if (includedResourceObject.type === resourceIdentifierObject.type && includedResourceObject.id === resourceIdentifierObject.id)
            {
                resourceObject = includedResourceObject;

                break;
            }
        }

        return resourceObject;
    }
}
