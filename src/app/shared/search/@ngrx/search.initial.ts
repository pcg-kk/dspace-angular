import {PaginatedSearchOptions} from '../models/paginated-search-options.model';

export interface SearchModel {
  searchOptions: PaginatedSearchOptions;
  searchResults: any;
  searchError: any;
  searchStatus: 'initial' | 'pending' | 'success' | 'error';
}

export const searchInitial: SearchModel = {
  searchOptions: undefined,
  searchResults: undefined,
  searchError: undefined,
  searchStatus: 'initial',
};
