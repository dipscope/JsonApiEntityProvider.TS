import { CustomKey } from '@dipscope/type-manager';
import { JsonApiResourceMetadata } from './json-api-resource-metadata';

/**
 * Key used to store json api resource metadata inside type manager custom data.
 * 
 * @type {CustomKey<JsonApiResourceMetadata<any>>}
 */
export const jsonApiResourceMetadataKey: CustomKey<JsonApiResourceMetadata<any>> = new CustomKey('$DSJsonApiResourceMetadata');
