// Angular
import {
  Component,
  Inject,
  Renderer2,
  PLATFORM_ID,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';

// Services
import { AppDataService } from 'src/app/services/app-data.service';

@Component({
  selector: 'app-cke-universal',
  templateUrl: './cke-universal.component.html',
  styleUrls: ['./cke-universal.component.css']
})
export class CkeUniversalComponent implements AfterViewInit {
  // https://www.lavalamp.biz/blogs/how-to-use-ckeditor-5-in-angular-with-server-side-rendering-support/
  // https://stackoverflow.com/questions/62076412/angular-universal-ckeditor5-window-is-not-defined

  @Input() textToEdit = '';
  @Output() textToEditChange = new EventEmitter();

  @ViewChild('scriptHost') scriptHost!: ElementRef;

  ckEditor: any; // set in loadCkEditor

  public ckeConfig = {
    toolbar: {
      items: [
        'Bold',
        'Italic',
        'Underline',
        '|',
        'bulletedList',
        'numberedList',
        '|',
        'indent',
        'outdent',
        '|',
        'heading',
        'fontSize',
        '|',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'link',
        '|',
        'undo',
        'redo'
      ],
      shouldNotGroupWhenFull: true
    },
    // htmlEncodeOutput: false
    // mediaEmbed: { previewsInData: true }, // NO! Keep semantic elements and render appropriately on display
    allowedContent: true
  };

  // Append script to local element, not document
  // @Inject(DOCUMENT) private document: Document,

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private renderer2: Renderer2,
    private appData: AppDataService
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCkEditor();
    } else if (isPlatformServer(this.platformId)) {
      //  server mode detected
    }
  }

  clearData() {
    // editor must be retaining old data somehow and property binding breaks down
    this.textToEdit = '';
    this.ckEditor.setData('');
  }

  loadCkEditor(): void {
    // Append script to document body
    // Stick with this as official implementation requires editing of node_modules
    // as error in visibility of getter/setters AND npm audit issues

    // Global fix for ExpressionChangedAfterItHasBeenCheckedError causing script to load twice and getting 2 editors
    if (this.appData.TAPInitialised) return;

    const ckeScript = this.renderer2.createElement('script');

    ckeScript.type = 'application/javascript';
    ckeScript.id = 'CKEScript';

    // script.src = 'https://cdn.ckeditor.com/ckeditor5/12.4.0/classic/ckeditor.js';
    // Use my custom build
    ckeScript.src = 'https://free.vote/assets/ckeditor.js';

    ckeScript.text = `
    ${(ckeScript.onload = async () => {
      const CKEditor = (window as any).ClassicEditor;

      this.ckEditor = await CKEditor.create(
        document.querySelector('#editor'),
        this.ckeConfig
      );

      this.ckEditor.model.document.on('change', () => {
        // this.textToEdit = JSON.stringify(editor.getData()); // necessary?
        this.textToEditChange.emit(this.ckEditor.getData());
      });
    })}
    `;

    this.renderer2.appendChild(this.scriptHost.nativeElement, ckeScript);

    this.appData.TAPInitialised = true;
  }
}
