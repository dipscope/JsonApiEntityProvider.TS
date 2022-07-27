import isNil from 'lodash/isNil';
import { CursorPaginateExpression, OffsetPaginateExpression, PaginateExpressionNotSupportedError, SizePaginateExpression } from '@dipscope/entity-store';
import { JsonApiPaginateExpressionVisitor } from '../json-api-paginate-expression-visitor';

/**
 * Json api net paginate expression visitor implementation.
 * 
 * @type {JsonApiNetPaginateExpressionVisitor}
 */
export class JsonApiNetPaginateExpressionVisitor extends JsonApiPaginateExpressionVisitor
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
     * Visits cursor paginate expression.
     *
     * @param {CursorPaginateExpression} cursorPaginateExpression Cursor paginate expression.
     *
     * @returns {string} Expression result.
     */
    public visitCursorPaginateExpression(cursorPaginateExpression: CursorPaginateExpression): string
    {
        throw new PaginateExpressionNotSupportedError(cursorPaginateExpression, this);
    }

    /**
     * Visits offset paginate expression.
     *
     * @param {OffsetPaginateExpression} offsetPaginateExpression Offset paginate expression.
     *
     * @returns {string} Expression result.
     */
    public visitOffsetPaginateExpression(offsetPaginateExpression: OffsetPaginateExpression): string
    {
        throw new PaginateExpressionNotSupportedError(offsetPaginateExpression, this);
    }

    /**
     * Visits size paginate expression.
     *
     * @param {SizePaginateExpression} sizePaginateExpression Size paginate expression.
     *
     * @returns {string} Expression result.
     */
    public visitSizePaginateExpression(sizePaginateExpression: SizePaginateExpression): string
    {
        const parts = new Array<string>();

        if (!isNil(sizePaginateExpression.size))
        {
            parts.push(`page[size]=${sizePaginateExpression.size}`);
        }

        if (!isNil(sizePaginateExpression.page))
        {
            parts.push(`page[number]=${sizePaginateExpression.page}`);
        }
        
        return parts.join('&');
    }
}
