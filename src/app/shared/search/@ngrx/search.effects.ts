import { Injectable } from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {errorLocation, pendingSearch, startSearch, successSearch} from './search.actions';
import {concatMap, of} from 'rxjs';
import {SearchService} from '../../../core/shared/search/search.service';
import {catchError, debounceTime, map, tap} from 'rxjs/operators';
import {Store} from '@ngrx/store';

@Injectable()
export class SearchEffects {

  searchRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(startSearch),
      concatMap((props) =>
        this.searchService.pcgSearch(props.searchOptions).pipe(
          tap(() => this.store$.dispatch(pendingSearch())),
          debounceTime(2000),
          map((searchResults) => successSearch({ searchResults })),
          catchError((error) => of(errorLocation({ error }))),
        ),
      ),
    );
  });

  constructor(
    private actions$: Actions,
    private store$: Store,
    private searchService: SearchService
  ) {}
}
