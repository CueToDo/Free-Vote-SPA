// Angular
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Model
import { Organisation } from 'src/app/models/organisation.model';

// Services
import { AppService } from 'src/app/services/app.service';

// Components
import { OrganisationListComponent } from 'src/app/organisations/organisation-list/organisation-list.component';
import { OrganisationEditComponent } from 'src/app/organisations/organisation-edit/organisation-edit.component';
import { OrganisationEditComponent as OrganisationEditComponent_1 } from '../organisation-edit/organisation-edit.component';
import { OrganisationListComponent as OrganisationListComponent_1 } from '../organisation-list/organisation-list.component';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-organisations',
    templateUrl: './organisations.component.html',
    styleUrls: ['./organisations.component.css'],
    standalone: true,
    imports: [MatButtonModule, MatTooltipModule, MatIconModule, NgClass, OrganisationListComponent_1, OrganisationEditComponent_1]
})
export class OrganisationsComponent implements OnInit, AfterViewInit {
  @ViewChild('OrganisationMembership')
  organisationMembership!: OrganisationListComponent;

  @ViewChild('OrganisationsAvailable')
  organisationsAvailable!: OrganisationListComponent;

  @ViewChild('NewGroupComponent') newGroupComponent!: OrganisationEditComponent;

  public tabIndex = 0;
  private tabSelected = '';
  public NewOrganisation = new Organisation();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.StartNewOrganisation(); // For OrganisationEdit, do this early

    // tab is not a route parameter, but a route segment
    // this.tabSelected = this.activatedRoute.snapshot.params['tab'];

    // https://stackoverflow.com/questions/49684409/how-to-get-angular-5-route-segments-from-activatedroute
    this.tabSelected = this.activatedRoute.snapshot.url[0].path;

    if (!this.tabSelected) {
      this.tabSelected = 'membership';
    }

    switch (this.tabSelected) {
      case 'membership':
        this.tabIndex = 0;
        break;
      case 'available':
        this.tabIndex = 1;
        break;
      case 'new':
        this.tabIndex = 2;
        break;
    }
  }

  ngAfterViewInit(): void {
    this.organisationMembership?.FetchOrganisations();
    this.newGroupComponent?.ClearError();
  }

  ChangeTab(tabIndex: number): void {
    this.tabIndex = tabIndex;

    switch (tabIndex) {
      case 0:
        this.organisationsAvailable?.AutoFetchOrganisations();
        this.appService.RouteParamChange$.next('/organisations/membership');
        break;
      case 1:
        this.StartNewOrganisation();
        this.newGroupComponent?.ClearError();
        this.appService.RouteParamChange$.next('/organisations/new');
        break;
    }
  }

  CancelNew(): void {
    this.ChangeTab(0);
  }

  CompleteNew(group: Organisation): void {
    this.router.navigate(['/organisations', group.organisationName]);
  }

  StartNewOrganisation(): void {
    this.NewOrganisation = new Organisation();
    this.NewOrganisation.countries = [
      { country: 'UK (inc NI)', countryID: 25, priority: 1, selected: true }
    ];
  }
}
