import {createAction, props} from '@ngrx/store';
import {PaginatedSearchOptions} from '../models/paginated-search-options.model';

export const startSearch = createAction('[Search] new query', props<{ searchOptions: PaginatedSearchOptions }>());

export const pendingSearch = createAction('[Search] pending search');
export const successSearch = createAction('[Search] success search', props<{ searchResults: any }>());
export const errorLocation = createAction('[Search] error search', props<{ error: any }>());

