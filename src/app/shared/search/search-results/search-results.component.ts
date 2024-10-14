import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RemoteData } from '../../../core/data/remote-data';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { fadeIn, fadeInOut } from '../../animations/fade';
import { SearchResult } from '../models/search-result.model';
import { PaginatedList } from '../../../core/data/paginated-list.model';
import { hasNoValue, isNotEmpty } from '../../empty.util';
import { SortOptions } from '../../../core/cache/models/sort-options.model';
import { ListableObject } from '../../object-collection/shared/listable-object.model';
import { CollectionElementLinkType } from '../../object-collection/collection-element-link.type';
import { ViewMode } from '../../../core/shared/view-mode.model';
import { Context } from '../../../core/shared/context.model';
import { PaginatedSearchOptions } from '../models/paginated-search-options.model';
import {Store} from '@ngrx/store';
import {SearchModel} from '../@ngrx/search.initial';
import {searchResults, searchStatus} from '../@ngrx/search.selectors';
import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Item} from '../../../core/shared/item.model';
import {ItemSearchResult} from '../../object-collection/shared/item-search-result.model';

export interface SelectionConfig {
  repeatable: boolean;
  listId: string;
}

@Component({
  selector: 'ds-search-results',
  templateUrl: './search-results.component.html',
  animations: [
    fadeIn,
    fadeInOut
  ]
})

/**
 * Component that represents all results from a search
 */
export class SearchResultsComponent {
  hasNoValue = hasNoValue;

  /**
   * The link type of the listed search results
   */
  @Input() linkType: CollectionElementLinkType;

  /**
   * The actual search result objects
   */
  @Input() searchResults: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>;

  /**
   * The current configuration of the search
   */
  @Input() searchConfig: PaginatedSearchOptions;

  /**
   * A boolean representing if show csv export button
   */
  @Input() showCsvExport = false;

  /**
   * Whether to show the thumbnail preview
   */
  @Input() showThumbnails;

  /**
   * The current sorting configuration of the search
   */
  @Input() sortConfig: SortOptions;

  /**
   * The current view-mode of the list
   */
  @Input() viewMode: ViewMode;

  /**
   * An optional configuration to filter the result on one type
   */
  @Input() configuration: string;

  /**
   * Whether or not to hide the header of the results
   * Defaults to a visible header
   */
  @Input() disableHeader = false;

  /**
   * A boolean representing if result entries are selectable
   */
  @Input() selectable = false;

  @Input() context: Context;

  /**
   * Option for hiding the pagination detail
   */
  @Input() hidePaginationDetail = false;

  /**
   * The config option used for selection functionality
   */
  @Input() selectionConfig: SelectionConfig = null;

  /**
   * Emit when one of the listed object has changed.
   */
  @Output() contentChange = new EventEmitter<any>();

  @Output() deselectObject: EventEmitter<ListableObject> = new EventEmitter<ListableObject>();

  @Output() selectObject: EventEmitter<ListableObject> = new EventEmitter<ListableObject>();

  public isLoading$: Observable<boolean> = this.store.select(searchStatus).pipe(tap(console.log), map((el) => el === 'pending'));
  public isError$: Observable<boolean> = this.store.select(searchStatus).pipe(map((el) => el === 'error'));
  public results$ = this.store.select(searchResults).pipe(map((el) => mapSourceToTarget(el)));

  constructor(protected store: Store<SearchModel>) {}

  /**
   * Check if search results are loading
   */
  isLoading() {
    return true;
    // return !this.showError() && (hasNoValue(this.searchResults) || hasNoValue(this.searchResults.payload) || this.searchResults.isLoading);
  }

  showError(): boolean {
    return false;
    // return this.searchResults?.hasFailed && (!this.searchResults?.errorMessage || this.searchResults?.statusCode !== 400);
  }

  errorMessageLabel(): string {
    return 'error.search-result';
    // return (this.searchResults?.statusCode  === 422) ? 'error.invalid-search-query' : 'error.search-results';
  }

  /**
   * Method to change the given string by surrounding it by quotes if not already present.
   */
  surroundStringWithQuotes(input: string): string {
    let result = input;

    if (isNotEmpty(result) && !(result.startsWith('\"') && result.endsWith('\"'))) {
      result = `"${result}"`;
    }

    return result;
  }
}

export function mapSourceToTarget(source: any): any {
  if (!source) {
    return source;
  }
  console.log(`map`, source);
  const page = source._embedded.searchResult._embedded.objects.map((obj: any) => {
    return Object.assign(new ItemSearchResult(), {
      hitHighlights: obj.hitHighlights || {},
      _links: {
        indexableObject: obj._links.indexableObject
      },
      indexableObject: Object.assign(new Item(), {
        handle: obj._embedded.indexableObject.handle,
        lastModified: obj._embedded.indexableObject.lastModified,
        isArchived: obj._embedded.indexableObject.inArchive,
        isDiscoverable: obj._embedded.indexableObject.discoverable,
        isWithdrawn: obj._embedded.indexableObject.withdrawn,
        _links: obj._embedded.indexableObject._links,
        _name: obj._embedded.indexableObject.name || 'IMPOSSIBLE_TO_MAP',
        id: obj._embedded.indexableObject.id,
        uuid: obj._embedded.indexableObject.uuid,
        type: obj._embedded.indexableObject.type,
        metadata: obj._embedded.indexableObject.metadata,
        thumbnail: obj._embedded.indexableObject.thumbnail || { source: { source: { source: { source: {} } } } },
        accessStatus: obj._embedded.indexableObject.accessStatus || { source: { source: { source: { source: {} } } } },
        item: obj._embedded.indexableObject.item || {}
      })
    });
  });

  return {
    timeCompleted: Date.now(),
    msToLive: 900000,
    lastUpdated: Date.now(),
    state: 'Success',
    errorMessage: null,
    payload: {
      type: {
        value: 'discovery-objects'
      },
      page,
      scope: source.scope,
      appliedFilters: source.appliedFilters,
      sort: source.sort,
      configuration: source.configuration,
      _links: source._embedded.searchResult._links,
      pageInfo: {
        elementsPerPage: source._embedded.searchResult.page.size,
        totalElements: source._embedded.searchResult.page.totalElements,
        totalPages: source._embedded.searchResult.page.totalPages,
        currentPage: source._embedded.searchResult.page.number + 1
      }
    },
    statusCode: 200
  };
}
