import { ValueTransformer } from 'typeorm';

export const DecimalToNumberTransformer: ValueTransformer = {
  to: (value: number | null): number | null => value, // store as-is
  from: (value: string | null): number | null =>
    value !== null ? parseFloat(value) : null, // convert string to number
};
