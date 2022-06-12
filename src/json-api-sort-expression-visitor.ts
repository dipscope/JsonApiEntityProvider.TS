import isNil from 'lodash/isNil';

import { AscSortExpression, DescSortExpression, SortExpressionVisitor } from '@dipscope/entity-store';

import { JsonApiExpressionVisitor } from './json-api-expression-visitor';

/**
 * Json api sort expression visitor which traverses expression tree and returns a result.
 * 
 * @type {JsonApiSortExpressionVisitor}
 */
export class JsonApiSortExpressionVisitor extends JsonApiExpressionVisitor implements SortExpressionVisitor<string>
{
    /**
     * Constructor.
     */
    public constructor()
    {
        super('sort=');

        return;
    }

    /**
     * Visits asc sort expression.
     * 
     * @param {AscSortExpression} ascSortExpression Asc sort expression.
     * 
     * @returns {string} Expression result.
     */
    public visitAscSortExpression(ascSortExpression: AscSortExpression): string
    {
        const propertyPath = ascSortExpression.propertyInfo.extractSerializedPropertyPath().join('.');
        const sort = propertyPath;

        if (isNil(ascSortExpression.parentSortExpression))
        {
            return sort;
        }

        const parentSort = ascSortExpression.parentSortExpression.accept(this);

        return `${parentSort},${sort}`;
    }
    
    /**
     * Visits desc sort expression.
     * 
     * @param {DescSortExpression} descSortExpression Desc sort expression.
     * 
     * @returns {string} Expression result.
     */
    public visitDescSortExpression(descSortExpression: DescSortExpression): string
    {
        const propertyPath = descSortExpression.propertyInfo.extractSerializedPropertyPath().join('.');
        const sort = `-${propertyPath}`;

        if (isNil(descSortExpression.parentSortExpression))
        {
            return sort;
        }

        const parentSort = descSortExpression.parentSortExpression.accept(this);

        return `${parentSort},${sort}`;
    }
}
