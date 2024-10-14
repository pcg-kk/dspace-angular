/**
 * Returns the user state.
 * @function getUserState
 * @param {AppState} state Top level state.
 * @return {AuthState}
 */
import {SearchModel} from './search.initial';
import {createFeatureSelector, createSelector} from '@ngrx/store';

export const searchStateSelector = createFeatureSelector('search');

export const searchStatus = createSelector(searchStateSelector, (searchState: SearchModel) => searchState.searchStatus);
export const searchResults = createSelector(searchStateSelector, (searchState: SearchModel) => searchState.searchResults);
