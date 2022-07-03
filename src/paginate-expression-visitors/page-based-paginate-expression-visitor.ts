import isNil from 'lodash/isNil';
import { PaginateExpression } from '@dipscope/entity-store';
import { JsonApiPaginateExpressionVisitor } from '../json-api-paginate-expression-visitor';

/**
 * Page based paginate expression visitor implementation.
 * 
 * @type {PageBasedPaginateExpressionVisitor}
 */
export class PageBasedPaginateExpressionVisitor extends JsonApiPaginateExpressionVisitor
{
    /**
     * Constructor.
     */
    public constructor()
    {
        super('');

        return;
    }
    
    /**
     * Visits paginate expression.
     * 
     * @param {PaginateExpression} paginateExpression Paginate expression.
     * 
     * @returns {string} Expression result.
     */
    public visitPaginateExpression(paginateExpression: PaginateExpression): string
    {
        const parts = new Array<string>();

        if (!isNil(paginateExpression.take))
        {
            parts.push(`page[size]=${paginateExpression.take}`);
        }
        
        // TODO: Handle skipping of entities.
        // if (!isNil(paginateExpression.skip))
        // {
        //     parts.push(`page[offset]=${paginateExpression.skip}`);
        // }

        return parts.join('&');
    }
}
