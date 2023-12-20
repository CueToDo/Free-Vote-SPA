// Angular
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-website-preview',
  templateUrl: './website-preview.component.html',
  styleUrls: ['./website-preview.component.css']
})
export class WebsitePreviewComponent implements OnInit {
  @Input() public LinkAddress = '';

  // Preview
  @Input() public ShowPreview = true;
  @Input() public Title = '';
  @Input() public Description = '';
  @Input() public DescriptionLineClamp = 2;
  @Input() public Image = '';

  constructor() {}

  ngOnInit(): void {}
}
