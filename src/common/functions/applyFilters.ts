import { SelectQueryBuilder, ObjectLiteral, DataSource } from 'typeorm';
import { getOperator } from './getOperator';
import { BadRequestException } from '@nestjs/common';
import { Filter } from '../interfaces/Filter.interface';

export function applyFilters<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  filters: Filter[],
  dataSource: DataSource,
  alias = 'entity',
  entity: new () => T,
): SelectQueryBuilder<T> {
  const columns = dataSource
    .getMetadata(entity)
    .columns.map((col) => col.propertyName);

  filters.forEach((filter, index) => {
    // Validate structure
    if (!filter.field || !filter.operator || filter.value === undefined) {
      throw new BadRequestException(
        `Invalid filter format. Each filter must have a field, operator, and value.`,
      );
    }

    // Validate field exists in entity
    if (!columns.includes(filter.field)) {
      throw new BadRequestException(
        `Invalid filter field "${filter.field}". Allowed fields: ${columns.join(', ')}`,
      );
    }

    const paramKey = `${filter.field}_${index}`;
    const fullField = `${alias}.${filter.field}`;

    switch (filter.operator) {
      case 'like':
        qb.andWhere(`CAST(${fullField} AS TEXT) ILIKE :${paramKey}`, {
          [paramKey]: `%${filter.value}%`,
        });
        break;

      case 'in':
      case 'notIn': {
        if (!Array.isArray(filter.value) || filter.value.length === 0) {
          throw new BadRequestException(
            `Operator "${filter.operator}" expects a non-empty array as value.`,
          );
        }
        const operator = getOperator(filter.operator); // IN or NOT IN
        qb.andWhere(`${fullField} ${operator} (:...${paramKey})`, {
          [paramKey]: filter.value,
        });
        break;
      }

      case 'between': {
        if (
          !Array.isArray(filter.value) ||
          filter.value.length !== 2 ||
          filter.value.some((v) => v === undefined || v === null)
        ) {
          throw new BadRequestException(
            `Operator "between" expects an array with exactly 2 non-null values.`,
          );
        }
        const [start, end] = filter.value;
        qb.andWhere(`${fullField} BETWEEN :start_${index} AND :end_${index}`, {
          [`start_${index}`]: start,
          [`end_${index}`]: end,
        });
        break;
      }

      default: {
        const operator = getOperator(filter.operator); // eg. '=', '<', '!='
        qb.andWhere(`${fullField} ${operator} :${paramKey}`, {
          [paramKey]: filter.value,
        });
        break;
      }
    }
  });

  return qb;
}
