import type { SavedFields, SavedSavedFields } from '../src/shared/kintone-events';

export const buildSavedFields = (overrides: Partial<SavedFields>): SavedFields =>
  overrides as SavedFields;

export const buildSavedSavedFields = (overrides: Partial<SavedSavedFields>): SavedSavedFields =>
  overrides as SavedSavedFields;
