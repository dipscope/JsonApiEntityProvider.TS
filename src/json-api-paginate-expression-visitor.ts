import { CursorPaginateExpression, OffsetPaginateExpression, PaginateExpressionVisitor, SizePaginateExpression } from '@dipscope/entity-store';
import { JsonApiExpressionVisitor } from './json-api-expression-visitor';

/**
 * Json api paginate expression visitor which traverses expression tree and returns a result.
 * 
 * @type {JsonApiPaginateExpressionVisitor}
 */
export abstract class JsonApiPaginateExpressionVisitor extends JsonApiExpressionVisitor implements PaginateExpressionVisitor<string>
{
    /**
     * Constructor.
     * 
     * @param {string} prefix Prefix which prepended right before returned result.
     */
    public constructor(prefix: string)
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
    public abstract visitCursorPaginateExpression(cursorPaginateExpression: CursorPaginateExpression): string;

    /**
     * Visits offset paginate expression.
     *
     * @param {OffsetPaginateExpression} offsetPaginateExpression Offset paginate expression.
     *
     * @returns {string} Expression result.
     */
    public abstract visitOffsetPaginateExpression(offsetPaginateExpression: OffsetPaginateExpression): string;

    /**
     * Visits size paginate expression.
     *
     * @param {SizePaginateExpression} sizePaginateExpression Size paginate expression.
     *
     * @returns {string} Expression result.
     */
    public abstract visitSizePaginateExpression(sizePaginateExpression: SizePaginateExpression): string;
}
