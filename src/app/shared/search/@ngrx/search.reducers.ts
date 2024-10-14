import {createReducer, on} from '@ngrx/store';
import {searchInitial, SearchModel} from './search.initial';
import { startSearch, pendingSearch, successSearch, errorLocation } from './search.actions';


export const searchReducers = createReducer<SearchModel>(
  searchInitial,
  on(startSearch, (state: SearchModel, { searchOptions }): SearchModel => {
    console.log('SERACH START!');
    return {
      ...state,
      searchOptions,
      searchStatus: 'initial',
      searchResults: undefined,
    };
  }),
  on(pendingSearch, (state: SearchModel): SearchModel => {
    console.log('SERACH PENDING');
    return {
      ...state,
      searchStatus: 'pending',
    };
  }),
  on(successSearch, (state: SearchModel, { searchResults }): SearchModel => {
    console.log('SERACH SUCCESS');
    return {
      ...state,
      searchResults,
      searchStatus: 'success',
    };
  }),
  on(errorLocation, (state: SearchModel, { error }): SearchModel => {
    console.log('SERACH ERROR');
    return {
      ...state,
      searchError: error,
      searchStatus: 'error',
    };
  }),
);
