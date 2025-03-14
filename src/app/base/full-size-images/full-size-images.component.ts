// Angular
import { Component, Inject } from '@angular/core';

// Material
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NgClass, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-full-size-images',
  templateUrl: './full-size-images.component.html',
  styleUrls: ['./full-size-images.component.css'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, NgClass, NgIf]
})
export class FullSizeImagesComponent {
  csvImages = '';
  index = 0;

  get images(): string[] {
    return this.csvImages.split(',');
  }

  get imageCount(): number {
    return this.images.length;
  }

  get imageSource(): string {
    if (this.images[this.index].startsWith('http'))
      return this.images[this.index];

    return 'https://api.free.vote/images/' + this.images[this.index];
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      csvPointImages: string;
      csvPointImagesEmbedded: string;
    }
  ) {
    this.csvImages = data.csvPointImages;
    // ToDo: EmbeddedImages could be removed now? No longer used?
    if (!!data.csvPointImages && !!data.csvPointImagesEmbedded)
      this.csvImages += ',';
    this.csvImages += data.csvPointImagesEmbedded;
  }

  next() {
    if (this.index < this.imageCount - 1) this.index++;
  }

  previous() {
    if (this.index > 0) this.index--;
  }
}
