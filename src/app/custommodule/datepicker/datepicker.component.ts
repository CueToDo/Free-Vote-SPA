import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.css']
})
export class DatepickerComponent {

  public dateValue: Date; // bound to date input and display output
  placeholder = 'Choose a date';

  // External Binding
  @Input()
  set Date(value: Date) {
    // Typescript can help, but javascript still rules
    // this.dateValue = value;
    this.dateValue = new Date(value); // Important that a new date object is created
  }

  @Input()
  set UserPrompt(value: string) {
    this.placeholder = value;
  }

  @Output()
  DateChange = new EventEmitter<Date>();


  DateSelected() {
    this.DateChange.emit(this.dateValue);
  }

}
