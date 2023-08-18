import { CustomKey } from '@dipscope/type-manager';

/**
 * Json api resource route key.
 * 
 * @type {CustomKey<string|undefined>}
 */
export const jsonApiResourceRouteKey: CustomKey<string|undefined> = new CustomKey<string|undefined>('$DSJsonApiResourceRoute');
