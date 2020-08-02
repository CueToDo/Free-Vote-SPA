import { PointEdit } from './../../models/point.model';
// Angular
import { Component, OnInit, Input, Output, EventEmitter, ɵbypassSanitizationTrustResourceUrl, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { HttpEventType } from '@angular/common/http';

// rxjs
import { Observable, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

// Models
import { Point } from 'src/app/models/point.model';
import { PointTypesEnum, PointSortTypes } from 'src/app/models/enums';
import { Kvp } from 'src/app/models/kvp.model';

// Services
import { LocalDataService } from 'src/app/services/local-data.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { PointsService } from 'src/app/services/points.service';
import { HttpService } from 'src/app/services/http.service';
import { tap, map, filter } from 'rxjs/operators';

@Component({
  selector: 'app-point-edit',
  templateUrl: './point-edit.component.html',
  styleUrls: ['./point-edit.component.css'],
  preserveWhitespaces: true
})
export class PointEditComponent implements OnInit, OnDestroy {

  // Point must be cloned for 1-way binding, otherwise cancelled changes get reflected in parent
  @Input() point: Point;
  @Output() pointChange = new EventEmitter(); // But manually controlling 2 way binding

  @Input() isPorQPoint = false;

  public pointClone: PointEdit; // manual control of 2 way binding (need to handle cancel edit)

  // Above banana in a box 2 way data binding works, but for some reason,
  // we must also emit new HTML to Point component after saving to database
  // Update: manual clone to save to databse then manual emit of updates from server

  @Output() CancelEdit = new EventEmitter();
  @Output() CompleteEdit = new EventEmitter();

  @ViewChild('imageSelect', { static: true }) imageSelect: ElementRef;

  selectedPointType: PointTypesEnum;

  // pointTypes: Array<[number, string]>;
  // https://stackoverflow.com/questions/47079366/expression-has-changed-after-it-was-checked-during-iteration-by-map-keys-in-angu/50749898
  pointTypes: Kvp[];
  hasMedia = false;
  hasLink = false;
  imageFileForUpload: File;
  imageName: string;
  showLinkBeforeVoteDisabled: boolean;

  userTouched = false;
  cancelled = false;
  saving = false;
  uploadingImage = false;
  imageUploadProgress = 0;
  error: string;

  // https://stackoverflow.com/questions/47079366/expression-has-changed-after-it-was-checked-during-iteration-by-map-keys-in-angu/50749898
  // pointKeys: IterableIterator<number>;

  config = {
    toolbar:
      [
        ['SpellChecker', 'Bold', 'Italic', 'Underline'], ['TextColor', 'BGColor'],
        ['NumberedList', 'BulletedList'], ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
        ['Link', 'Unlink', 'Source'], ['Image', 'Table', 'HorizontalRule', 'SpecialChar'],
        ['Format', 'Font', 'FontSize']
      ],
    // htmlEncodeOutput: false
    allowedContent: true
  };

  imageUploadObservable: Observable<string>;

  constructor(
    private localData: LocalDataService,
    private appData: AppDataService,
    private pointsService: PointsService,
    private httpService: HttpService) {
    // Must provide default values to bind before ngOnOnit
    // Host can override with Input value
  }

  ngOnInit() {

    let slashTag = '';

    if (!this.isPorQPoint) {
      slashTag = this.localData.PreviousSlashTagSelected;
    }

    if (!this.point) { this.NewPoint(slashTag); } else {
      this.pointClone = <PointEdit><any>this.appData.deep(this.point);
    }

    this.appData.PointTypes().subscribe(
      pointTypes => this.pointTypes = pointTypes
    );

    this.autoShowLinkEdit(this.pointClone.pointTypeID);

    this.hasMedia = (this.pointClone.youTubeID || this.pointClone.soundCloudTrackID) ? true : false;

  }

  onCKEBlur() {
    this.userTouched = !this.cancelled;
    this.cancelled = false;
  }

  addVideo() {
    this.hasMedia = true;
  }

  removeVideo() {
    this.pointClone.youTubeID = '';
    this.hasMedia = false;
  }

  imageSelected(event) {
    this.imageFileForUpload = <File>event.target.files[0];
    this.imageName = this.imageFileForUpload.name;
  }


  ImageUploadObservable(): Observable<string> {
    // Initialised each time before use to check whether there is an image to uplaod

    this.uploadingImage = true;
    this.imageUploadProgress = 0;

    if (this.imageFileForUpload) {
      return this.httpService.uploadImage(this.imageFileForUpload)
        .pipe(
          tap(event => {
            // tap changes nothing in the pipe. What came in goes out
            switch (event.type) {
              case HttpEventType.Sent:
                console.log(`Uploading file "${this.imageName}" of size ${this.imageFileForUpload.size}.`);
                break;
              case HttpEventType.UploadProgress:
                // Compute and show the % done:
                const percentDone = Math.round(100 * event.loaded / event.total);
                this.imageUploadProgress = percentDone;
                console.log(`File "${this.imageName}" is ${percentDone}% uploaded.`);
                break;
              case HttpEventType.Response:
                this.uploadingImage = false;
                console.log(`File "${this.imageName}" was completely uploaded!`);
                console.log(event.body.imageFileName, event.body.imageID);
                this.pointClone.pointHTML += `<img src="${event.body.imageFileName}">`;
                this.imageName = '';
                this.imageFileForUpload = null;
                this.imageSelect.nativeElement.value = '';
                break;
              default:
                console.log(`File "${this.imageName}" surprising upload event: ${event.type}.`);
            }
          }),
          filter(event => event.type === HttpEventType.Response),
          map(event => event['body'].imageID)
        );
    } else {
      // This is the important conditional "Do Nothing"
      return of('');
    }
  }


  // Upload Image before saving point to get a server filename and ImageID
  uploadImage() {

    this.error = '';

    // Must initialise before subscribing - may do nothing
    this.imageUploadObservable = this.ImageUploadObservable();

    this.imageUploadObservable
      .subscribe(
        {
          next: imageID => {
            // Image now has a database ID, but is not yet attached to unsaved point
            // ... will be attached when point updated
            if (!this.pointClone.csvImageIDs) { this.pointClone.csvImageIDs = ''; } // Don't want undefined
            this.pointClone.csvImageIDs += imageID + ',';
          },
          error: serverError => this.error = serverError.error.detail,
          complete: () => this.uploadingImage = false
        }
      );

  }

  imageRemove() {
    this.imageFileForUpload = null;
  }



  onSubmit() {

    // if the full url has been pasted get the id after the "="
    // What about tiny urls without the = but with the id?
    // console.log('SCTID: ', this.pointClone.soundCloudTrackID);

    this.error = '';

    if (!this.isPorQPoint && (!this.pointClone.slashTags || this.pointClone.slashTags.length === 0)) {
      this.error = 'Points must have at least one slash tag';
    } else if (!(!!this.pointClone.title && !!this.pointClone.url)
      && !(!!this.pointClone.pointHTML || !!this.pointClone.youTubeID || !!this.pointClone.soundCloudTrackID
        || !!this.pointClone.csvImageIDs || !!this.imageSelect.nativeElement.value)) {
      this.error = 'Point title and text OR url OR image OR media link must be provided';
    } else {

      this.saving = true;

      const isNew = !this.pointClone.pointID || this.pointClone.pointID < 1;

      // Has voter removed SlashTagSelected?
      let returnToSlashTag = this.localData.PreviousSlashTagSelected;
      let tagChange = false;

      if (!this.pointClone.slashTags.includes(returnToSlashTag)) {
        returnToSlashTag = this.pointClone.slashTags[0];
        tagChange = true;
      }

      // Must always initialise before subscribing - may be nothing to upload
      this.imageUploadObservable = this.ImageUploadObservable();

      this.imageUploadObservable
        .pipe(
          map(imageID => {
            /// There may not be an image upload, in which case the imageID will be ''
            // There could be a situation where we've uploaded an image
            // and then attached another without uploading, but we're now saving
            if (!this.pointClone.csvImageIDs) { this.pointClone.csvImageIDs = ''; } // Don't want undefined
            this.pointClone.csvImageIDs += imageID + ',';
          }),
          // but we'll always update point after any image upload
          concatMap(() => this.pointsService.PointUpdate(this.pointClone, this.isPorQPoint))
        )
        .subscribe({
          next: (response: Point) => {
            this.saving = false;
            this.userTouched = false;
            // this.point.csvImageIDs = ''; // Only needed for upload, now complete??

            if (isNew) {
              this.NewPoint(returnToSlashTag);
            } else {
              // pointID only needed for new points, but parent reselects - we're not dependent on 2 way binding
              // save response to point not pointClone, and manually emit
              this.point = <Point><any>this.appData.deep(response);
              this.pointChange.emit(this.point);
            }

            this.localData.PreviousSlashTagSelected = returnToSlashTag;

            // Communicate the change to PointComponent (No subscriptions)
            // Emit to TagsPoints component for sort descending indication only
            // But don't get parent TagsPoints to trigger reselection in sibling points now
            this.CompleteEdit.emit(response.pointID); // emit pointID for porq to attach

            // Communicate change to sibling PointsComponent
            // where Points ReSelection Takes place:
            if (isNew || tagChange) {
              this.appData.SetSlashTag(returnToSlashTag, PointSortTypes.DateDescend);
            }

          },
          error: serverError => {
            this.saving = false;
            this.error = serverError.error.detail;
          },
          complete: () => {
            this.uploadingImage = false;
            this.hasMedia = false;
          }
        });
    }
  }

  NewPoint(slashTag: string) {
    // Clear old Values when edit complete
    this.pointClone = new Point();
    this.pointClone.pointID = -1;
    this.pointClone.pointHTML = '';
    this.pointClone.pointTypeID = PointTypesEnum.Opinion;

    if (!!slashTag) {
      this.pointClone.slashTags = [slashTag];
    } else {
      this.pointClone.slashTags = [];
    }

    this.error = '';
    this.userTouched = false;
  }


  Cancel() {

    // Delete any uploaded images from server
    if (!!this.pointClone.csvImageIDs) {
      this.httpService.ImageUploadCancel(this.pointClone.csvImageIDs).subscribe(
        {
          next: () => {
            this.pointClone = new Point();
            this.cancelled = true;
            this.CancelEdit.next();
          },
          error: serverError => this.error = serverError.error.detail
        }
      );
    } else {
      this.pointClone = new Point();
      this.cancelled = true;
      this.CancelEdit.next();
    }
  }

  autoShowLinkEdit(pointTypeID: PointTypesEnum) {

    // Automatically show link input for certain point types
    if (this.appData.ShowSource(pointTypeID)) {
      this.showLinkEdit();
    } else {
      if (this.pointClone.source || this.pointClone.url) {
        this.showLinkEdit();
      } else {
        this.hideLinkEdit();
      }
    }
  }

  onPointTypeChange(pointTypeID: PointTypesEnum) {

    this.autoShowLinkEdit(pointTypeID);

    // Automatically update default "show" if voter changes point type
    this.showLinkBeforeVoteDisabled = this.appData.ShowSource(pointTypeID);
    this.pointClone.showLinkBeforeVote = this.appData.ShowSource(pointTypeID);

  }

  showLinkEdit() {
    this.hasLink = true;
  }

  hideLinkEdit() {
    this.hasLink = false;
    this.pointClone.source = '';
    this.pointClone.url = '';
  }

  ngOnDestroy() {
    // When an Observable issues an OnError or OnComplete notification to its observers,
    // this ends the subscription.
    // Observers do not need to issue an Unsubscribe notification to end subscriptions
    // that are ended by the Observable in this way.
    /// No need to unsubscribe http calls which will end with completion or error
  }

}
