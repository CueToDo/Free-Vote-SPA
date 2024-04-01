// Angular
import { Component, Input } from '@angular/core';

// Models
import { Country } from 'src/app/models/country.model';
import { MatIconModule } from '@angular/material/icon';
import { NgFor, NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'app-countries',
    templateUrl: './countries.component.html',
    styleUrls: ['./countries.component.css'],
    standalone: true,
    imports: [NgFor, NgClass, NgIf, MatIconModule]
})
export class CountriesComponent {
  @Input() Countries: Country[] = [];

  public get Selected(): Country[] {
    return this.Countries.filter(country => country.selected);
  }

  error = '';
  selected: Country | undefined = undefined;

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
