import { Component, OnInit } from '@angular/core';
import { TagsService, Tag } from '../../services/tags.service';
import { HttpClientService } from '../../services/http-client.service';

@Component({
  selector: 'app-trending',
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.css'],
  providers: [TagsService, HttpClientService] //Need HttpClientService as well as TagsService
})

export class TrendingComponent implements OnInit {

  tags: Tag[];

  constructor(private tagsService: TagsService) { }
  //constructor(){}

  ngOnInit() {
    this.tagsService.Trending().subscribe(response => {
      console.log('data back');
      this.tags = response;
    })
  }

  FontSize(Weight: number): string {
    var perCent = 100 + Weight * 50;
    return perCent + "%";
  }
}
