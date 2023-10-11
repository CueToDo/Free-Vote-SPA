// Angular
import { Component, Inject, Input, OnInit } from '@angular/core';

// Material
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';

// Models enums
import { Tag } from 'src/app/models/tag.model';

// Services
import { TagsService } from 'src/app/services/tags.service';
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-local-tags',
  templateUrl: './local-tags.component.html',
  styleUrls: ['./local-tags.component.css']
})
export class LocalTagsComponent implements OnInit {
  AllTags: Tag[] = [];
  TagsDisplay: Tag[] = []; // AllTags filtered on National/Constituency
  fetchingTags = false;
  showHelp = false;

  get constituencyID(): number {
    return this.data.constituencyTags ? this.data.constituencyID : 0;
  }

  // [mat-dialog-close] bound on save button returns Tags

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      pointID: number;
      constituencyTags: boolean;
      constituencyID: number;
    },
    public localData: LocalDataService,
    private tagsService: TagsService
  ) {}

  ngOnInit(): void {
    this.GetPointTagsEdit();
  }

  onConstituencyFilterChanged($filterForConstituency: MatCheckboxChange) {
    this.data.constituencyTags = $filterForConstituency.checked;
    this.filterTags();
  }

  filterTags(): void {
    this.TagsDisplay = this.AllTags.filter(
      tag => tag.constituencyTag === this.data.constituencyTags
    );
  }

  GetPointTagsEdit(): void {
    // Get all national and constituency tags for the point
    this.fetchingTags = true;
    this.tagsService
      .PointTagsEdit(this.data.pointID, this.localData.ConstituencyIDVoter)
      .subscribe(tags => {
        this.AllTags = tags;
        this.filterTags(); // Display only national or constituency tags
        this.fetchingTags = false;
      });
  }
}
