import { CustomKey } from '@dipscope/type-manager';

/**
 * Json api resource id key.
 * 
 * @type {CustomKey<string|undefined>}
 */
export const jsonApiResourceIdKey: CustomKey<string|undefined> = new CustomKey<string|undefined>('$DSJsonApiResourceId');
