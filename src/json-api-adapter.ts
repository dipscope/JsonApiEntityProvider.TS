import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import toNumber from 'lodash/toNumber';
import toString from 'lodash/toString';
import { Entity, EntityCollection, Nullable } from '@dipscope/entity-store';
import { PropertyMetadata, ReferenceCallback, TypeMetadata } from '@dipscope/type-manager';
import { ReferenceKey, ReferenceValue, SerializerContext } from '@dipscope/type-manager';
import { JsonApiResourceManager } from './json-api-resource-manager';
import { JsonApiResourceMetadata } from './json-api-resource-metadata';
import { JsonApiResourceMetadataNotFoundError } from './json-api-resource-metadata-not-found-error';
import { AttributesObject } from './types/attributes-object';
import { DocumentObject } from './types/document-object';
import { RelationshipObject } from './types/relationship-object';
import { RelationshipsObject } from './types/relationships-object';
import { ResourceIdentifierObject } from './types/resource-identifier-object';
import { ResourceObject } from './types/resource-object';

/**
 * Represents json api adapter to build document objects from entities and back.
 * 
 * @type {JsonApiAdapter}
 */
export class JsonApiAdapter
{
    /**
     * Allow to many relationship replacement?
     * 
     * @type {boolean}
     */
    public readonly allowToManyRelationshipReplacement: boolean;
    
    /**
     * Constructor.
     * 
     * @param {boolean} allowToManyRelationshipReplacement Allow to many relationship replacement?
     */
    public constructor(allowToManyRelationshipReplacement: boolean)
    {
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
    public extractJsonApiResourceMetadataOrFail<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>): JsonApiResourceMetadata<TEntity>
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
    public extractJsonApiResourceMetadata<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>): JsonApiResourceMetadata<TEntity> | undefined
    {
        const jsonApiResourceMetadata = JsonApiResourceManager.extractJsonApiResourceMetadataFromTypeMetadata(typeMetadata);

        return jsonApiResourceMetadata;
    }

    /**
     * Creates serializer context for object.
     * 
     * @param {TypeMetadata<TEntity>} typeMetadata Type metadata.
     * @param {any} x Root object.
     * 
     * @returns {SerializerContext<TEntity>} Entity serializer context.
     */
    private createSerializerContext<TEntity extends Entity>(typeMetadata: TypeMetadata<TEntity>, x: any): SerializerContext<TEntity>
    {
        const serializerContext = new SerializerContext({
            $: x,
            path: '$',
            typeMetadata: typeMetadata,
            referenceCallbackMap: new WeakMap<ReferenceKey, Array<ReferenceCallback>>(),
            referenceMap: new WeakMap<ReferenceKey, ReferenceValue>()
        });

        return serializerContext;
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
        const serializerContext = this.createSerializerContext(typeMetadata, entity);
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
        const serializerContext = this.createSerializerContext(typeMetadata, serializedEntity);
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
    private createResourceObjectSerializedEntity(typeMetadata: TypeMetadata<Entity>, resourceObject: ResourceObject, includedResourceObjects: Array<ResourceObject>): Entity
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
