import type { EmployeeId } from '@hrms/shared';
import { atom } from 'jotai';

// Example feature-local UI state. Branded ids from @hrms/shared flow end to end,
// so the frontend can't mix an employee id with another entity's id either.
export const selectedEmployeeIdState = atom<EmployeeId | null>(null);
