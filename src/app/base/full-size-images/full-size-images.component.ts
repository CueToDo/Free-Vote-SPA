// Angular
import { Component, Inject } from '@angular/core';

// Material
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-full-size-images',
  templateUrl: './full-size-images.component.html',
  styleUrls: ['./full-size-images.component.css']
})
export class FullSizeImagesComponent {
  csvPointImages = '';
  index = 0;

  get imageCount(): number {
    return this.images.length;
  }

  get images(): string[] {
    return this.csvPointImages.split(',');
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      csvPointImages: string;
    }
  ) {
    this.csvPointImages = data.csvPointImages;
  }

  next() {
    if (this.index < this.imageCount - 1) this.index++;
  }

  previous() {
    if (this.index > 0) this.index--;
  }
}
