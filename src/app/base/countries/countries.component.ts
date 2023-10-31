// Angular
import { Component, Input, OnInit } from '@angular/core';

// Models
import { Country } from 'src/app/models/country.model';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css']
})
export class CountriesComponent implements OnInit {
  @Input() Countries: Country[] = [];

  public get Selected(): Country[] {
    return this.Countries.filter(country => country.selected);
  }

  error = '';
  selected: Country | undefined = undefined;

  ngOnInit() {}

  select(country: string, selected: boolean): void {
    // effin js arrays
    const index = this.Countries.findIndex(item => item.country === country);
    const updated = this.Countries[index];
    updated.selected = selected;
    this.Countries.splice(index, 1, updated);

    if (selected)
      this.Countries.forEach(item => {
        if (item.priority != updated.priority) item.selected = false;
      });
  }
}
