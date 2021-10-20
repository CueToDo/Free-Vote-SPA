import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '../material.module';

// Pipes
import { TagDisplayPipe } from './pipes/tag-display.pipe';
import { NbspPipe } from './pipes/nbsp.pipe';
import { SafeURLPipe } from './pipes/safe-url.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';

// Directives
import { ElementScrollDirective } from './directives/elementscroll.directive';

// Components
import { DatepickerComponent } from './datepicker/datepicker.component';

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  declarations: [
    DatepickerComponent,
    NbspPipe,
    SafeURLPipe,
    ElementScrollDirective,
    TagDisplayPipe,
    SafeHtmlPipe
  ],
  exports: [
    DatepickerComponent,
    NbspPipe,
    SafeURLPipe,
    SafeHtmlPipe,
    ElementScrollDirective,
    TagDisplayPipe
  ],
  providers: []
})
export class CustomModule {}
