import { JsonApiFilterExpressionVisitor } from './json-api-filter-expression-visitor';
import { JsonApiMetadataExtractor } from './json-api-metadata-extractor';
import { JsonApiPaginateExpressionVisitor } from './json-api-paginate-expression-visitor';
import { JsonApiRequestInterceptor } from './json-api-request-interceptor';
import { JsonApiResponseInterceptor } from './json-api-response-interceptor';

/**
 * Options to configure json api entity provider.
 * 
 * @type {JsonApiEntityProviderOptions}
 */
export interface JsonApiEntityProviderOptions
{
    /**
     * Base url of json api.
     * 
     * @type {string}
     */
    baseUrl: string;

    /**
     * Json api request interceptor if any.
     * 
     * @type {JsonApiRequestInterceptor}
     */
    jsonApiRequestInterceptor?: JsonApiRequestInterceptor;

    /**
     * Json api response interceptor if any.
     * 
     * @type {JsonApiResponseInterceptor}
     */
    jsonApiResponseInterceptor?: JsonApiResponseInterceptor;

    /**
     * Json api metadata extractor.
     * 
     * @type {JsonApiMetadataExtractor}
     */
    jsonApiMetadataExtractor?: JsonApiMetadataExtractor;

    /**
     * Custom json api filter expression visitor to override default behaviour.
     * 
     * @type {JsonApiFilterExpressionVisitor}
     */
    jsonApiFilterExpressionVisitor?: JsonApiFilterExpressionVisitor;

    /**
     * Custom json api paginate expression visitor to override default behaviour.
     * 
     * @type {JsonApiPaginateExpressionVisitor}
     */
    jsonApiPaginateExpressionVisitor?: JsonApiPaginateExpressionVisitor;
    
    /**
     * Since full replacement of to-many relationship may be a very dangerous operation, a server 
     * may choose to disallow it. By default such relationships are not sent. You can enable this by
     * setting this option to true.
     * 
     * @type {boolean}
     */
    allowToManyRelationshipReplacement?: boolean;
    
    /**
     * The browser cookie access policy
     */
    credentials?: RequestCredentials;
}
