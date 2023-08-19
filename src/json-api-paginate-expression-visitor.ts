import { isNil } from 'lodash';
import { CursorPaginateExpression, OffsetPaginateExpression, PaginateExpressionVisitor, SizePaginateExpression } from '@dipscope/entity-store';
import { JsonApiExpressionVisitor } from './json-api-expression-visitor';

/**
 * Json api paginate expression visitor which traverses expression tree and returns a result.
 * 
 * @type {JsonApiPaginateExpressionVisitor}
 */
export class JsonApiPaginateExpressionVisitor extends JsonApiExpressionVisitor implements PaginateExpressionVisitor<string>
{
    /**
     * Constructor.
     * 
     * @param {string} prefix Prefix which prepended right before returned result.
     */
    public constructor(prefix: string = '')
    {
        super(prefix);

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
        const parts = new Array<string>();

        if (!isNil(cursorPaginateExpression.take))
        {
            parts.push(`page[take]=${cursorPaginateExpression.take}`);
        }
        
        if (!isNil(cursorPaginateExpression.afterCursor))
        {
            parts.push(`page[after]=${cursorPaginateExpression.afterCursor}`);
        }

        if (!isNil(cursorPaginateExpression.beforeCursor))
        {
            parts.push(`page[before]=${cursorPaginateExpression.beforeCursor}`);
        }
        
        return parts.join('&');
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
        const parts = new Array<string>();

        if (!isNil(offsetPaginateExpression.offset))
        {
            parts.push(`page[offset]=${offsetPaginateExpression.offset}`);
        }

        if (!isNil(offsetPaginateExpression.limit))
        {
            parts.push(`page[limit]=${offsetPaginateExpression.limit}`);
        }
        
        return parts.join('&');
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
