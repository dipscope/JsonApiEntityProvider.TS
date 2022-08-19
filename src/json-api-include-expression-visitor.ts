import { isNil } from 'lodash';
import { IncludeExpression, IncludeExpressionVisitor } from '@dipscope/entity-store';
import { JsonApiExpressionVisitor } from './json-api-expression-visitor';

/**
 * Json api include expression visitor which traverses expression tree and returns a result.
 * 
 * @type {JsonApiIncludeExpressionVisitor}
 */
export class JsonApiIncludeExpressionVisitor extends JsonApiExpressionVisitor implements IncludeExpressionVisitor<string>
{
    /**
     * Constructor.
     */
    public constructor()
    {
        super('include=');

        return;
    }

    /**
     * Visits include expression.
     * 
     * @param {IncludeExpression} includeExpression Include expression.
     * 
     * @returns {string} Expression result.
     */
    public visitIncludeExpression(includeExpression: IncludeExpression): string
    {
        const propertyPath = includeExpression.propertyInfo.extractSerializedPropertyPath().join('.');

        if (isNil(includeExpression.parentIncludeExpression))
        {
            return propertyPath;
        }
        
        const parentInclude = this.visitIncludeExpression(includeExpression.parentIncludeExpression);
        const separator = isNil(includeExpression.entityInfo) ? '.' : ',';

        return `${parentInclude}${separator}${propertyPath}`;
    }
}
