import { Entity } from '@dipscope/entity-store';
import { TypeFn, TypeManager } from '@dipscope/type-manager';
import { JsonApiResourceMetadata } from './json-api-resource-metadata';
import { JsonApiResourceOptions } from './json-api-resource-options';

/**
 * Decorator to configure json api resource.
 * 
 * @param {TypeOptions<TType>} jsonApiResourceOptions Json api resource options.
 *
 * @returns {ClassDecorator} Class decorator.
 */
export function JsonApiResource<TEntity extends Entity>(jsonApiResourceOptions: JsonApiResourceOptions): ClassDecorator
{
    return function (target: any): any
    {
        const typeFn = target as TypeFn<TEntity>;
        
        TypeManager.configureTypeMetadata(typeFn).configureTypeExtensionMetadata(JsonApiResourceMetadata, jsonApiResourceOptions);

        return target;
    };
}
