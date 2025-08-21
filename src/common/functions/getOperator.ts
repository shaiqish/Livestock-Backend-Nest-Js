import { BadRequestException } from '@nestjs/common';

export function getOperator(operator: string): string {
  const map = {
    eq: '=',
    neq: '!=',
    gt: '>',
    lt: '<',
    gte: '>=',
    lte: '<=',
    like: 'ILIKE',
    in: 'IN',
    notIn: 'NOT IN',
    between: 'BETWEEN',
  };
  if (!operator || !map[operator]) {
    throw new BadRequestException(
      `Invalid operator: ${operator}. Available operators: ${Object.keys(map).join(', ')}`,
    );
  }
  return map[operator];
}
