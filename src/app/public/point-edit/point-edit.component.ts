// Angular
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

// rxjs
import { Observable, of, Subscription } from 'rxjs';
import { tap, map, concatMap } from 'rxjs/operators';

// Lodash https://github.com/lodash/lodash/issues/3192
import { cloneDeep } from 'lodash-es';

// Models
import { ImageDownload } from 'src/app/models/Image.model';
import { Kvp } from 'src/app/models/kvp.model';
import { Point } from 'src/app/models/point.model';
import { PointEdit } from 'src/app/models/point.model';
import { PointTypesEnum } from 'src/app/models/enums';
import { Tag } from 'src/app/models/tag.model';

// Components
import { CkeUniversalComponent } from '../cke-universal/cke-universal.component';
import { TagsEditComponent } from '../../base/tags-edit/tags-edit.component';

// Services
import { BasicService } from 'src/app/services/basic.service';
import { HtmlService } from 'src/app/services/html.service';
import { HttpService } from 'src/app/services/http.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { LookupsService } from 'src/app/services/lookups.service';
import { PointsService } from 'src/app/services/points.service';
import { TagsService } from 'src/app/services/tags.service';

@Component({
  selector: 'app-point-edit',
  templateUrl: './point-edit.component.html',
  styleUrls: ['./point-edit.component.css'],
  preserveWhitespaces: true,
  standalone: true,
  imports: [
    FormsModule,
    CkeUniversalComponent,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    TagsEditComponent,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    MatCheckboxModule
  ]
})
export class PointEditComponent implements OnInit {
  // Point must be cloned for 1-way binding, otherwise cancelled changes get reflected in parent
  @Input() point: Point | undefined;
  @Output() pointChange = new EventEmitter(); // But manually controlling 2 way binding

  @Input() parentPointID = 0;
  @Input() questionID = 0;

  @Input() isPorQPoint = false;
  @Input() isMyAnswer = false;
  @Input() isComment = false;
  @Input() error = '';

  @ViewChild('CKEfudge', { static: true }) ckeFudge: any;

  public pointClone = new PointEdit(); // manual control of 2 way binding (need to handle cancel edit)

  // Above banana in a box 2 way data binding works, but for some reason,
  // we must also emit new HTML to Point component after saving to database
  // Update: manual clone to save to databse then manual emit of updates from server

  @Output() CancelEdit = new EventEmitter();
  @Output() CompleteEdit = new EventEmitter(); // reselect for tag change

  // https://stackoverflow.com/questions/51193187/my-template-reference-variable-nativeelement-is-undefined
  // https://stackoverflow.com/questions/37450805/what-is-the-read-parameter-in-viewchild-for
  // read ElementRef required because this example is within a form?
  @ViewChild('tvPointTitle', { read: ElementRef }) tvPointTitle:
    | ElementRef
    | undefined;

  @ViewChild('imageSelect', { static: true }) imageSelect:
    | ElementRef
    | undefined;

  selectedPointType = PointTypesEnum.NotSelected;

  // pointTypes: Array<[number, string]>;
  // https://stackoverflow.com/questions/47079366/expression-has-changed-after-it-was-checked-during-iteration-by-map-keys-in-angu/50749898
  pointTypes: Kvp[] = [];
  hasMedia = false;
  imageFileForUpload: File | undefined;
  imageName = '';
  quoteOrLinkTextPlaceholder = 'quote or link text';

  userTouched = false;
  cancelled = false;
  waiting = false;
  uploadingImage = false;
  imageUploadProgress = 0;
  allowTags = true;

  // https://stackoverflow.com/questions/47079366/expression-has-changed-after-it-was-checked-during-iteration-by-map-keys-in-angu/50749898
  // pointKeys: IterableIterator<number>;

  // Subscriptions
  private lookups$: Subscription | undefined;
  private tagsEdit$: Subscription | undefined;
  private imageUpload$: Subscription | undefined;
  private imageUploadCancel$: Subscription | undefined;
  private pointUpdate$: Subscription | undefined;

  constructor(
    private basicService: BasicService,
    private htmlService: HtmlService,
    private httpService: HttpService,
    private localData: LocalDataService,
    private lookupsService: LookupsService,
    private pointsService: PointsService,
    private tagsService: TagsService
  ) {
    // Must provide default values to bind before ngOnOnit
    // Host can override with Input value
  }

  ngOnInit(): void {
    if (!!this.point) {
      this.pointClone = cloneDeep(this.point) as PointEdit;
      this.GetPointTagsEdit();
    }

    this.lookups$ = this.lookupsService
      .PointTypes()
      .subscribe(pointTypes => (this.pointTypes = pointTypes));

    if (this.pointClone) {
      this.hasMedia = this.pointClone.soundCloudTrackID ? true : false;
    }

    if (this.isComment) {
      this.allowTags = false;
    }
  }

  GetPointTagsEdit(): void {
    // Get all national and constituency tags for the point
    this.waiting = true;

    this.tagsEdit$ = this.tagsService
      .PointTagsEdit(
        this.pointClone.pointID,
        this.localData.ConstituencyIDVoter
      )
      .subscribe(tags => {
        this.pointClone.tags = tags.filter(
          tag => tag.constituencyTag === this.localData.forConstituency
        );
        this.waiting = false;
      });
  }

  onCKEBlur(): void {
    this.userTouched = !this.cancelled;
    this.cancelled = false;
  }

  imageSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    this.imageFileForUpload = files ? files[0] : undefined;
    const name = this.imageFileForUpload?.name;
    if (name) {
      this.imageName = name;
    }
  }

  ImageUploadObservable(): Observable<string> {
    // Initialised each time before use to check whether there is an image to uplaod

    this.uploadingImage = true;
    this.imageUploadProgress = 0;

    if (this.imageFileForUpload) {
      return this.httpService
        .uploadImage(this.pointClone.pointID, this.imageFileForUpload)
        .pipe(
          tap(response => {
            // ToDo: Implement image upload progress in API (never properly implemented here)
            // tap changes nothing in the pipe. What came in goes out
            // type is only relevant if the reponse is an HttpEvent
            // switch (response.type) {
            //   case HttpEventType.Sent:
            //     console.log(
            //       `Uploading file "${this.imageName}" of size ${this.imageFileForUpload?.size}.`
            //     );
            //     break;
            //   case HttpEventType.UploadProgress:
            //     // Compute and show the % done: This only works if the API sends progress status
            //     // Get round possibility of response.total being undefined
            //     const total = response.total
            //       ? response.total
            //       : 2 * response.loaded;
            //     const percentDone = Math.round((100 * response.loaded) / total);
            //     this.imageUploadProgress = percentDone;
            //     console.log(
            //       `File "${this.imageName}" is ${percentDone}% uploaded.`
            //     );
            //     break;
            //   case HttpEventType.Response:
            //     break;
            //   default:
            //     console.log(
            //       `File "${this.imageName}" surprising upload event: ${response.type}.`
            //     );
            // }
          }),
          // filter(response => response.type === HttpEventType.Response),
          map((response: ImageDownload) => {
            this.uploadingImage = false;
            // const responseBody = (response as HttpResponse<ImageDownload>).body;

            if (this.pointClone) {
              this.pointClone.pointHTML += `<img src="${response?.imageFileName}">`;
            }
            this.imageName = '';
            this.imageFileForUpload = undefined;
            if (this.imageSelect) {
              this.imageSelect.nativeElement.value = '';
            }

            let id = response?.imageID;
            if (!id) {
              id = '';
            }
            return id;
          })
        );
    } else {
      // This is the important conditional "Do Nothing"
      return of('');
    }
  }

  // Upload Image before saving point to get a server filename and ImageID
  uploadImage(): void {
    this.error = '';

    if (this.pointClone) {
      this.imageUpload$ = this.ImageUploadObservable().subscribe({
        next: imageID => {
          // Image now has a database ID, but is not yet attached to unsaved point
          // ... will be attached when point updated
          if (this.pointClone) {
            if (!this.pointClone.csvImageIDs) {
              this.pointClone.csvImageIDs = '';
            } // Don't want undefined
            this.pointClone.csvImageIDs += imageID + ',';
          }
        },
        error: serverError => (this.error = serverError.error.detail),
        complete: () => (this.uploadingImage = false)
      });
    }
  }

  imageRemove(): void {
    this.imageFileForUpload = undefined;
  }

  onSubmit(): void {
    // if the full url has been pasted get the id after the "="
    // What about tiny urls without the = but with the id?

    if (!this.pointClone) {
      this.error = 'Missing: point to edit';
    } else {
      this.error = '';

      if (this.htmlService.SpanHasStyle(this.pointClone.pointHTML)) {
        if (
          confirm(
            'Remove styling (eg colour/background colour?\nClick cancel to keep style.'
          )
        ) {
          this.pointClone.pointHTML = this.htmlService.RemoveSpansWithStyle(
            this.pointClone.pointHTML
          );
        }
      }

      let newOrRetainedTags = this.pointClone.tags
        .filter(tag => tag.tagByMeNew)
        .map(tag => tag.slashTag);

      if (
        !this.isComment &&
        !this.isMyAnswer &&
        !this.isPorQPoint &&
        (!newOrRetainedTags || newOrRetainedTags.length === 0)
      ) {
        // Only owner can update point, so owner must provide at least one tag
        this.error = 'Points must have at least one slash tag';
      } else if (
        // Title is always optional
        !(
          !!this.pointClone.pointHTML ||
          !!this.pointClone.soundCloudTrackID ||
          !!this.pointClone.csvImageIDs ||
          !!this.imageSelect?.nativeElement.value
        )
      ) {
        this.error = 'Point text, url, image or media link must be provided';
      } else {
        this.waiting = true;
        const isNew = !this.pointClone.pointID || this.pointClone.pointID < 1;

        // Point may be an answer
        if (this.pointClone.questionID < 1 && this.questionID > 0)
          this.pointClone.questionID = this.questionID;

        // Has voter removed SlashTagSelected?
        let returnToSlashTag = this.localData.SlashTagSelected;
        let currentTagIncluded = newOrRetainedTags.includes(returnToSlashTag);

        this.localData.TagChange = false;

        // return to a new slashTag if current tag removed (not comment or questionAnswer)
        if (!currentTagIncluded && !this.isComment && this.questionID == 0) {
          returnToSlashTag = newOrRetainedTags[0];
          this.localData.TagChange = true;
        }

        // Only send tags to add/delete for update (will only be add for new point)
        // Filter on tags added or removed by me - don't update another persons tags
        // tagByMe != tagByMeNew means we need to add or remove this tag
        this.pointClone.tags = this.pointClone.tags.filter(
          tag => tag.tagByMe != tag.tagByMeNew // belt & braces: same filter in PointUpdate
        );

        // Must always initialise before subscribing - may be nothing to upload

        this.pointUpdate$ = this.ImageUploadObservable()
          .pipe(
            map(imageID => {
              /// There may not be an image upload, in which case the imageID will be ''
              // There could be a situation where we've uploaded an image
              // and then attached another without uploading, but we're now saving the point
              if (this.pointClone) {
                // Don't want undefined
                if (!this.pointClone.csvImageIDs) {
                  this.pointClone.csvImageIDs = '';
                }
                if (!!imageID) {
                  this.pointClone.csvImageIDs += imageID + ',';
                }
              }
            }),
            // but we'll always update point after any image upload
            concatMap(_ => {
              if (!this.pointClone) {
                return of(new Point());
              } else {
                return this.pointsService.PointUpdate(
                  this.pointClone,
                  this.isMyAnswer,
                  this.isComment,
                  this.isPorQPoint
                );
              }
            })
            // Don't get link meta data here from API - it slows user repsonse
            // but we will need to handle separately on new point and existing point edit
          )
          .subscribe({
            next: (pointReturned: Point) => {
              this.waiting = false;
              this.userTouched = false;

              if (this.localData.TagChange)
                this.tagsService.SetSlashTag(returnToSlashTag);

              if (!!pointReturned)
                // save response to point not pointClone
                this.point = cloneDeep(pointReturned);

              if (isNew)
                this.PrepareNewPoint(
                  this.pointClone.parentPointID,
                  returnToSlashTag
                );
              else this.pointChange.emit(this.point); // Update bound parent

              // Communicate the change to all parents
              this.CompleteEdit.emit();
            },
            error: serverError => {
              this.waiting = false;
              this.error = this.basicService.GetError(serverError);
            },
            complete: () => {
              this.uploadingImage = false;
            }
          });
      }
    }
  }

  PrepareNewPoint(parentPointID: number, slashTag: string): void {
    // Clear old Values when edit complete
    this.pointClone = new Point();
    this.pointClone.pointID = -1;
    this.pointClone.parentPointID = parentPointID;
    this.pointClone.questionID = 0;
    this.pointClone.pointTypeID = PointTypesEnum.Opinion;

    this.pointClone.pointHTML = ''; // doesn't get through to ckEditor on property binding
    this.ckeFudge?.clearData(); // Must explicitly clear previous data

    this.pointClone.constituencyID = this.localData.ConstituencyID;

    if (!!slashTag) {
      let newTag = new Tag(slashTag, this.localData.ConstituencyID);
      newTag.tagByMeNew = true;
      this.pointClone.tags = [newTag];
    } else {
      this.pointClone.tags = [];
    }

    this.error = '';
    this.userTouched = false;

    // Put cursor in TitleInput
    setTimeout(() => {
      this.tvPointTitle?.nativeElement.focus();
    }, 500);
  }

  Cancel(): void {
    // Delete any uploaded images from server
    if (!!this.pointClone?.csvImageIDs) {
      this.imageUploadCancel$ = this.httpService
        .ImageUploadCancel(this.pointClone.csvImageIDs)
        .subscribe({
          next: () => {
            this.pointClone = new Point();
            this.cancelled = true;
            this.CancelEdit.next(null);
          },
          error: serverError => (this.error = serverError.error.detail)
        });
    } else {
      this.pointClone = new Point();
      this.cancelled = true;
      this.CancelEdit.next(null);
    }
  }

  // autoShowLinkEdit(pointTypeID: PointTypesEnum): void {
  //   // Automatically show link input for certain point types
  //   if (this.lookupsService.ShowSource(pointTypeID)) {
  //     this.showLinkEdit();
  //   } else {
  //     if (this.pointClone?.linkText || this.pointClone?.linkAddress) {
  //       this.showLinkEdit();
  //     } else {
  //       this.hideLinkEdit();
  //     }
  //   }
  // }

  onPointTypeChange(pointTypeID: PointTypesEnum): void {
    // this.autoShowLinkEdit(pointTypeID);
    // Automatically update default "show" if voter changes point type
    // this.showLinkBeforeVoteDisabled =
    //   !this.lookupsService.ShowSource(pointTypeID);
    // if (this.pointClone) {
    //   this.pointClone.showLinkPreview = !this.showLinkBeforeVoteDisabled;
    // }
  }

  // showLinkEdit(): void {
  //   this.hasLink = true;
  //   this.showLinkBeforeVoteDisabled = false;
  // }

  // hideLinkEdit(): void {
  //   this.hasLink = false;
  //   if (this.pointClone) {
  //     this.pointClone.linkText = '';
  //     this.pointClone.linkAddress = '';
  //   }
  // }

  showLinkPreview(show: boolean): void {
    if (this.pointClone) {
      if (show) {
        this.quoteOrLinkTextPlaceholder = 'quote or link text not required';
      } else {
        this.quoteOrLinkTextPlaceholder = 'quote or link text';
      }
    }
  }

  ngOnDestroy(): void {
    // When an Observable issues an OnError or OnComplete notification to its observers,
    // this ends the subscription.
    // Observers do not need to issue an Unsubscribe notification to end subscriptions
    // that are ended by the Observable in this way.
    // No need to unsubscribe http calls which will end with completion or error
    // But do we know our calls are issuing OnComplete?
    this.lookups$?.unsubscribe();
    this.tagsEdit$?.unsubscribe();
    this.pointUpdate$?.unsubscribe();
    this.imageUpload$?.unsubscribe();
    this.imageUploadCancel$?.unsubscribe();
  }
}
