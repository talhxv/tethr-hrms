import type { ThemeName } from '@hrms/ui';
import { atom } from 'jotai';


// UI state (the active color mode) belongs in an atom (architecture.md §5.2).
export const themeModeState = atom<ThemeName>('light');
