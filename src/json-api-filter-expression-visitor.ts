import { AndFilterExpression, ContainsFilterExpression, FilterExpressionNotSupportedError, FilterExpressionVisitor } from '@dipscope/entity-store';
import { EndsWithFilterExpression, EqFilterExpression, GtFilterExpression } from '@dipscope/entity-store';
import { GteFilterExpression, InFilterExpression, LtFilterExpression } from '@dipscope/entity-store';
import { LteFilterExpression, NotContainsFilterExpression, NotEndsWithFilterExpression } from '@dipscope/entity-store';
import { NotEqFilterExpression, NotInFilterExpression, NotStartsWithFilterExpression } from '@dipscope/entity-store';
import { OrFilterExpression, StartsWithFilterExpression } from '@dipscope/entity-store';
import { JsonApiExpressionVisitor } from './json-api-expression-visitor';

/**
 * Json api filter expression visitor which traverses expression tree and returns a result.
 * 
 * @type {JsonApiFilterExpressionVisitor}
 */
export class JsonApiFilterExpressionVisitor extends JsonApiExpressionVisitor implements FilterExpressionVisitor<string>
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
     * Visits equal filter expression.
     * 
     * @param {EqFilterExpression} eqFilterExpression Equal filter expression.
     * 
     * @returns {string} Expression result.
     */
    public visitEqFilterExpression(eqFilterExpression: EqFilterExpression): string
    {
        throw new FilterExpressionNotSupportedError(eqFilterExpression, this);
    }

    /**
     * Visits not equal filter expression.
     * 
     * @param {NotEqFilterExpression} notEqFilterExpression Not equal filter expression.
     * 
     * @returns {string} Expression result.
     */
    public visitNotEqFilterExpression(notEqFilterExpression: NotEqFilterExpression): string 
    {
        throw new FilterExpressionNotSupportedError(notEqFilterExpression, this);
    }

    /**
     * Visits in filter expression.
     * 
     * @param {InFilterExpression} inFilterExpression In filter expression.
     * 
     * @returns {string} Expression result.
     */
    public visitInFilterExpression(inFilterExpression: InFilterExpression): string
    {
        throw new FilterExpressionNotSupportedError(inFilterExpression, this);
    }

    /**
     * Visits not in filter expression.
     * 
     * @param {NotInFilterExpression} notInFilterExpression Not in filter expression.
     * 
     * @returns {string} Expression result.
     */
    public visitNotInFilterExpression(notInFilterExpression: NotInFilterExpression): string
    {
        throw new FilterExpressionNotSupportedError(notInFilterExpression, this);
    }

    /**
     * Visits greater than filter expression.
     * 
     * @param {GtFilterExpression} gtFilterExpression Greater than filter expression.
     * 
     * @returns {string} Expression result.
     */
    public visitGtFilterExpression(gtFilterExpression: GtFilterExpression): string
    {
        throw new FilterExpressionNotSupportedError(gtFilterExpression, this);
    }

    /**
     * Visits greater than or equal filter expression.
     * 
     * @param {GteFilterExpression} gteFilterExpression Greater than or equal filter expression.
     * 
     * @returns {string} Expression result.
     */
    public visitGteFilterExpression(gteFilterExpression: GteFilterExpression): string
    {
        throw new FilterExpressionNotSupportedError(gteFilterExpression, this);
    }

    /**
     * Visits lower than filter expression.
     * 
     * @param {LtFilterExpression} ltFilterExpression Lower than filter expression.
     * 
     * @returns {string} Expression result.
     */
    public visitLtFilterExpression(ltFilterExpression: LtFilterExpression): string
    {
        throw new FilterExpressionNotSupportedError(ltFilterExpression, this);
    }

    /**
     * Visits lower than or equal filter expression.
     * 
     * @param {LteFilterExpression} lteFilterExpression Lower than or equal filter expression.
     * 
     * @returns {string} Expression result.
     */
    public visitLteFilterExpression(lteFilterExpression: LteFilterExpression): string
    {
        throw new FilterExpressionNotSupportedError(lteFilterExpression, this);
    }

    /**
     * Visits contains filter expression.
     * 
     * @param {ContainsFilterExpression} containsFilterExpression Contains filter expression.
     * 
     * @returns {string} Expression result.
     */
    public visitContainsFilterExpression(containsFilterExpression: ContainsFilterExpression): string
    {
        throw new FilterExpressionNotSupportedError(containsFilterExpression, this);
    }

    /**
     * Visits not contains filter expression.
     * 
     * @param {NotContainsFilterExpression} notContainsFilterExpression Not contains filter expression.
     * 
     * @returns {string} Expression result.
     */
    public visitNotContainsFilterExpression(notContainsFilterExpression: NotContainsFilterExpression): string
    {
        throw new FilterExpressionNotSupportedError(notContainsFilterExpression, this);
    }

    /**
     * Visits starts with filter expression.
     * 
     * @param {StartsWithFilterExpression} startsWithFilterExpression Starts with filter expression.
     * 
     * @returns {string} Expression result.
     */
    public visitStartsWithFilterExpression(startsWithFilterExpression: StartsWithFilterExpression): string
    {
        throw new FilterExpressionNotSupportedError(startsWithFilterExpression, this);
    }

    /**
     * Visits not starts with filter expression.
     * 
     * @param {NotStartsWithFilterExpression} notStartsWithFilterExpression Not starts with filter expression.
     * 
     * @returns {string} Expression result.
     */
    public visitNotStartsWithFilterExpression(notStartsWithFilterExpression: NotStartsWithFilterExpression): string
    {
        throw new FilterExpressionNotSupportedError(notStartsWithFilterExpression, this);
    }

    /**
     * Visits ends with filter expression.
     * 
     * @param {EndsWithFilterExpression} endsWithFilterExpression Ends with filter expression.
     * 
     * @returns {string} Expression result.
     */
    public visitEndsWithFilterExpression(endsWithFilterExpression: EndsWithFilterExpression): string
    {
        throw new FilterExpressionNotSupportedError(endsWithFilterExpression, this);
    }

    /**
     * Visits not ends with filter expression.
     * 
     * @param {NotEndsWithFilterExpression} notEndsWithFilterExpression Not ends with filter expression.
     * 
     * @returns {string} Expression result.
     */
    public visitNotEndsWithFilterExpression(notEndsWithFilterExpression: NotEndsWithFilterExpression): string
    {
        throw new FilterExpressionNotSupportedError(notEndsWithFilterExpression, this);
    }

    /**
     * Visits and filter expression.
     * 
     * @param {AndFilterExpression} andFilterExpression And filter expression.
     * 
     * @returns {string} Expression result.
     */
    public visitAndFilterExpression(andFilterExpression: AndFilterExpression): string
    {
        throw new FilterExpressionNotSupportedError(andFilterExpression, this);
    }

    /**
     * Visits or filter expression.
     * 
     * @param {OrFilterExpression} orFilterExpression Or filter expression.
     * 
     * @returns {string} Expression result.
     */
    public visitOrFilterExpression(orFilterExpression: OrFilterExpression): string
    {
        throw new FilterExpressionNotSupportedError(orFilterExpression, this);
    }
}
