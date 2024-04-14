import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCheckCircle,
  faExclamationCircle,
  faPlus,
  faSave,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import {
  Observable,
  of as observableOf,
} from 'rxjs';
import { map } from 'rxjs/operators';

import { SubmissionRestService } from '../../../core/submission/submission-rest.service';
import { SubmissionScopeType } from '../../../core/submission/submission-scope-type';
import { isNotEmpty } from '../../../shared/empty.util';
import { BrowserOnlyPipe } from '../../../shared/utils/browser-only.pipe';
import { SubmissionService } from '../../submission.service';

/**
 * This component represents submission form footer bar.
 */
@Component({
  selector: 'ds-submission-form-footer',
  styleUrls: ['./submission-form-footer.component.scss'],
  templateUrl: './submission-form-footer.component.html',
  standalone: true,
  imports: [CommonModule, BrowserOnlyPipe, TranslateModule, FontAwesomeModule],
})
export class SubmissionFormFooterComponent implements OnChanges {
  protected readonly faTrash = faTrash;
  protected readonly faCheckCircle = faCheckCircle;
  protected readonly faExclamationCircle = faExclamationCircle;
  protected readonly faPlus = faPlus;
  protected readonly faSave = faSave;

  /**
   * The submission id
   * @type {string}
   */
  @Input() submissionId: string;

  /**
   * A boolean representing if a submission deposit operation is pending
   * @type {Observable<boolean>}
   */
  public processingDepositStatus: Observable<boolean>;

  /**
   * A boolean representing if a submission save operation is pending
   * @type {Observable<boolean>}
   */
  public processingSaveStatus: Observable<boolean>;

  /**
   * A boolean representing if showing deposit and discard buttons
   * @type {Observable<boolean>}
   */
  public showDepositAndDiscard: Observable<boolean>;

  /**
   * A boolean representing if submission form is valid or not
   * @type {Observable<boolean>}
   */
  public submissionIsInvalid: Observable<boolean> = observableOf(true);

  /**
   * A boolean representing if submission form has unsaved modifications
   */
  public hasUnsavedModification: Observable<boolean>;

  /**
   * Initialize instance variables
   *
   * @param {NgbModal} modalService
   * @param {SubmissionRestService} restService
   * @param {SubmissionService} submissionService
   */
  constructor(private modalService: NgbModal,
              private restService: SubmissionRestService,
              private submissionService: SubmissionService) {
  }

  /**
   * Initialize all instance variables
   */
  ngOnChanges(changes: SimpleChanges) {
    if (isNotEmpty(this.submissionId)) {
      this.submissionIsInvalid = this.submissionService.getSubmissionStatus(this.submissionId).pipe(
        map((isValid: boolean) => isValid === false),
      );

      this.processingSaveStatus = this.submissionService.getSubmissionSaveProcessingStatus(this.submissionId);
      this.processingDepositStatus = this.submissionService.getSubmissionDepositProcessingStatus(this.submissionId);
      this.showDepositAndDiscard = observableOf(this.submissionService.getSubmissionScope() === SubmissionScopeType.WorkspaceItem);
      this.hasUnsavedModification = this.submissionService.hasUnsavedModification();
    }
  }

  /**
   * Dispatch a submission save action
   */
  save(event) {
    this.submissionService.dispatchSave(this.submissionId, true);
  }

  /**
   * Dispatch a submission save for later action
   */
  saveLater(event) {
    this.submissionService.dispatchSaveForLater(this.submissionId);
  }

  /**
   * Dispatch a submission deposit action
   */
  public deposit(event) {
    this.submissionService.dispatchDeposit(this.submissionId);
  }

  /**
   * Dispatch a submission discard action
   */
  public confirmDiscard(content) {
    this.modalService.open(content).result.then(
      (result) => {
        if (result === 'ok') {
          this.submissionService.dispatchDiscard(this.submissionId);
        }
      },
    );
  }
}
