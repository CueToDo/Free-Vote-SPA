
// Angular
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

// Lodash https://github.com/lodash/lodash/issues/3192
const cloneDeep = require('lodash/cloneDeep');

import * as CKEditor from '@ckeditor/ckeditor5-build-classic';

// Models and Enums
import { PorQEdit } from '../../models/porq.model';
import { PorQTypes } from 'src/app/models/enums';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { PsandQsService } from '../../services/psandqs.service';

@Component({
  selector: 'app-porq-edit',
  templateUrl: './porq-edit.component.html',
  styleUrls: ['./porq-edit.component.css']
})
export class PorqEditComponent implements OnInit {

  @Output() CancelEdit = new EventEmitter();
  @Output() CompleteEdit = new EventEmitter();

  @Input() public porQ: PorQEdit;

  public ckeditor = CKEditor;

  public porQEdit: PorQEdit;
  public PorQTypes = PorQTypes;

  saving = false;

  error = '';

  config = {
    toolbar:
      [
        ['SpellChecker', 'Bold', 'Italic', 'Underline'], ['TextColor', 'BGColor'],
        ['NumberedList', 'BulletedList'], ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
        ['Link', 'Unlink', 'Source'], ['Image', 'Table', 'HorizontalRule', 'SpecialChar'],
        ['Format', 'Font', 'FontSize']
      ],
    // htmlEncodeOutput: false
    allowedContent: true
  };

  constructor(
    private PsAndQs: PsandQsService,
    public appData: AppDataService
  ) { }

  ngOnInit(): void {
    this.porQEdit = cloneDeep(this.porQ);
  }

  onCKEBlur(): void {

  }

  onSubmit(): void {

    this.PsAndQs.PorQUpdate(this.porQEdit).subscribe(
      {
        next: _ => this.CompleteEdit.emit(this.porQEdit),
        error: serverError => this.error = serverError.error.detail
      }
    );

  }

  cancel(): void {
    this.CancelEdit.emit();
  }

}
