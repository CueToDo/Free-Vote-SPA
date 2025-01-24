// Angular
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';

// rxjs

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Models/enums
import { ImageDownload, ProfilePicture } from 'src/app/models/Image.model';

// Services
import { LocalDataService } from './local-data.service';

export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline'
}

@Injectable({ providedIn: 'root' })
export class HttpService {
  constructor(
    private httpClient: HttpClient,
    private localData: LocalDataService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  public online = false;

  // https://www.inoaspect.com.au/creating-a-progressive-web-app-pwa-service-to-include-all-features-angular/
  subscribeNetworkStatus() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener(
        NetworkStatus.ONLINE,
        this.onNetworkStatusChange.bind(this)
      );
      window.addEventListener(
        NetworkStatus.OFFLINE,
        this.onNetworkStatusChange.bind(this)
      );
    }
  }

  onNetworkStatusChange() {
    this.online = navigator.onLine;
  }

  private RequestHeaders(isForm: boolean, reportProgress: boolean): any {
    // https://stackoverflow.com/questions/45286764/angular-4-3-httpclient-doesnt-send-header/45286959#45286959
    // The instances of the new HttpHeader class are immutable objects.
    // state cannot be changed after creation

    // but you can create a new variable by append
    // https://stackoverflow.com/questions/45286764/angular-httpclient-doesnt-send-header/45286959#45286959
    // Do not set an empty string to a header - it becomes undefined and the post fails

    // Full request options consists of headers only
    const token = this.localData.AccessToken;

    let profileString = '';

    if (!!this.localData.freeVoteProfile)
      profileString = JSON.stringify(this.localData.freeVoteProfile);

    // Use Forms to post images
    // https://stackoverflow.com/questions/61602744/contenttype-for-httpheaders-when-uploading-file-in-formdata
    // .set('Content-Type', 'multipart/form-data;boundary=SOME_BOUNDARY'); let the automagic happen

    let httpHeaders = undefined;

    if (isForm) {
      // Web Browser will add  Content-Type header itself (with boundary), so we don't need to add it
      httpHeaders = new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('SPAWebsite', this.localData.SPAWebsite)
        .set('VoterProfile', profileString);
    } else {
      httpHeaders = new HttpHeaders()
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('Authorization', `Bearer ${token}`)
        .set('SPAWebsite', this.localData.SPAWebsite)
        .set('VoterProfile', profileString);
    }

    // reportProgress for imageUploads
    return { headers: httpHeaders, reportProgress: reportProgress };
  }

  public get(url: string): Observable<any> {
    // Always await a response before making the API call
    // always check we have a valid jwt first whether logged in with Auth0 or not

    this.localData.Log(`About to call API, ${this.localData.apiUrl}${url}`);

    const headers = this.RequestHeaders(false, false);

    return this.httpClient // call the free vote api
      .get(this.localData.apiUrl + url, headers);
  }

  public post(url: string, data: any): Observable<any> {
    return this.httpClient // call the free vote api
      .post(
        this.localData.apiUrl + url,
        JSON.stringify(data),
        this.RequestHeaders(false, false)
      );
  }

  public postForm(url: string, formData: FormData): Observable<any> {
    return this.httpClient // call the free vote api
      .post(
        this.localData.apiUrl + url,
        JSON.stringify(formData),
        this.RequestHeaders(true, true)
      );
  }

  public postFormType<T>(url: string, formData: FormData): Observable<any> {
    return this.httpClient // call the free vote api
      .post<T>(
        this.localData.apiUrl + url,
        formData,
        this.RequestHeaders(true, true)
      );
  }

  public uploadImage(
    pointID: number,
    imageFile: File
  ): Observable<ImageDownload> {
    // If the API returns progress update to HttpEvent<ImageDownload>
    // Max Shwartzmuller https://www.youtube.com/watch?v=YkvqLNcJz3Y

    let formData = new FormData();
    formData.set('pointID', pointID.toString());
    formData.set('image', imageFile, imageFile.name);

    const url = 'points/imageUpload';

    return this.postFormType<ImageDownload>(url, formData);
  }

  public uploadProfilePicture(pictureUpload: File): Observable<ProfilePicture> {
    const fd = new FormData();
    fd.append('imageObject', pictureUpload, pictureUpload.name);

    const url = 'profile/pictureUpload';

    // Max Shwartzmuller https://www.youtube.com/watch?v=YkvqLNcJz3Y

    return this.postFormType<ProfilePicture>(url, fd);
  }

  public profilePictureDelete(): Observable<string> {
    const url = 'profile/pictureDelete';

    return this.get(url);
  }

  public ImageUploadCancel(csvImageIDs: string): Observable<boolean> {
    // https://rules.sonarsource.com/typescript/RSPEC-3498
    // When an already-defined variable is given the same name within a new object,
    // object-shorthand syntax is preferred as being more compact.
    // Similarly, object-shorthand is also preferred for the definition of functions in object literals.

    const ImagesUploadCancel = { csvImageIDs };
    const url = 'points/imagesUploadCancel';

    return this.post(url, ImagesUploadCancel).pipe(map(_ => true));
  }
}
