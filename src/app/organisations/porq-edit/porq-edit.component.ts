
// Angular
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

// Models and Enums
import { PorQEdit, PorQ } from '../../models/porq.model';
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

  @Input() public porQ: PorQ;

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
    this.porQEdit = <PorQEdit><any>this.appData.deep(this.porQ);
  }

  onCKEBlur() {

  }

  onSubmit() {

    this.PsAndQs.PorQUpdate(this.porQEdit).subscribe(
      {
        next: _ => this.CompleteEdit.emit(this.porQEdit),
        error: serverError => this.error = serverError.error.detail
      }
    );

  }

  cancel() {
    this.CancelEdit.emit();
  }

}
