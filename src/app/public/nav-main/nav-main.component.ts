import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav-main',
  templateUrl: './nav-main.component.html',
  styleUrls: ['./nav-main.component.css']
})
export class NavMainComponent implements OnInit {
  nada = false;
  constructor() {}

  ngOnInit(): void {
    this.nada = false;
  }
}
