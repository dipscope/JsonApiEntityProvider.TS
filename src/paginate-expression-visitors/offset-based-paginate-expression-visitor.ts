import isNil from 'lodash/isNil';
import { PaginateExpression } from '@dipscope/entity-store';
import { JsonApiPaginateExpressionVisitor } from '../json-api-paginate-expression-visitor';

/**
 * Offset based paginate expression visitor implementation.
 * 
 * @type {OffsetBasedPaginateExpressionVisitor}
 */
export class OffsetBasedPaginateExpressionVisitor extends JsonApiPaginateExpressionVisitor
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
            parts.push(`page[limit]=${paginateExpression.take}`);
        }

        if (!isNil(paginateExpression.skip))
        {
            parts.push(`page[offset]=${paginateExpression.skip}`);
        }

        return parts.join('&');
    }
}
