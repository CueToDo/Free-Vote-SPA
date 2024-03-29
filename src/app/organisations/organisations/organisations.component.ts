// Angular
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Model
import { Organisation } from 'src/app/models/organisation.model';

// Services
import { AppDataService } from 'src/app/services/app-data.service';

// Components
import { OrganisationListComponent } from 'src/app/organisations/organisation-list/organisation-list.component';
import { OrganisationEditComponent } from 'src/app/organisations/organisation-edit/organisation-edit.component';

@Component({
  selector: 'app-organisations',
  templateUrl: './organisations.component.html',
  styleUrls: ['./organisations.component.css']
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
    private appDataService: AppDataService
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
        this.appDataService.RouteParamChange$.next('/organisations/membership');
        break;
      case 1:
        this.StartNewOrganisation();
        this.newGroupComponent?.ClearError();
        this.appDataService.RouteParamChange$.next('/organisations/new');
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
