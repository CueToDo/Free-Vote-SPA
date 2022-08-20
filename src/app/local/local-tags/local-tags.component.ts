// Angular
import { Component, Inject, Input, OnInit } from '@angular/core';

// Material
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

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
  public Tags: Tag[] = [];
  fetchingTags = false;
  showHelp = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { pointID: number },
    public localData: LocalDataService,
    private tagsService: TagsService
  ) {}

  ngOnInit(): void {
    this.GetPointTags();
  }

  GetPointTags(): void {
    this.fetchingTags = true;
    this.tagsService
      .PointTags(this.data.pointID, this.localData.ConstituencyID())
      .subscribe(tags => {
        this.Tags = tags;
        this.fetchingTags = false;
      });
  }
}
