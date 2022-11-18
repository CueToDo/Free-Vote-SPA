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

  localEditor: any; // set in loadCkEditor

  editorID = '';
  // To distinguish multiple editors on same page (can't use pointID for multiple new points)
  // We now still get the error "duplicate modules" but we don't actually get duplicate editors
  // A/W an Ivy impementation of CKEditor

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
    private renderer2: Renderer2
  ) {
    // identifiers cannot be numbers - prefix with cke
    this.editorID = `cke${Math.floor(Math.random() * 1000)}`;
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initialiseCKEditor();
    } else if (isPlatformServer(this.platformId)) {
      //  server mode detected
    }
  }

  clearData() {
    // editor must be retaining old data somehow and property binding breaks down
    this.textToEdit = '';
    if (!!this.localEditor) {
      this.localEditor.setData('');
    }
  }

  // Need to wait for Ivy enabled editor
  // https://github.com/ckeditor/ckeditor5-angular/issues/99
  // This is without Angular support - https://www.lavalamp.biz/blogs/how-to-use-ckeditor-5-in-angular-with-server-side-rendering-support/

  initialiseCKEditor(): void {
    // Append script to document body
    // Stick with this as official implementation requires editing of node_modules
    // as error in visibility of getter/setters AND npm audit issues

    // Global fix for ExpressionChangedAfterItHasBeenCheckedError
    // causing script to load twice and getting 2 editors

    if (!!this.localEditor) return; // Don't recreate (shouldn't be an issue)

    // dynamically create and load the script element
    const ckeScriptElement = this.renderer2.createElement('script');

    ckeScriptElement.type = 'application/javascript';
    ckeScriptElement.id = 'CKEScript';

    // Use my custom build
    ckeScriptElement.src = 'https://free.vote/assets/ckeditor.js';
    // ckeScriptElement.src = 'https://cdn.ckeditor.com/ckeditor5/35.3.0/classic/ckeditor.js';

    ckeScriptElement.text = `
    ${(ckeScriptElement.onload = async () => {
      // Presumably ClassicEditor is a class defined in the classic/custom build
      // CKEditor is our instance
      const CKEditor = (window as any).ClassicEditor;

      // ckEditor is an instance of our text editor, charged with capabilities from CKEditor
      // Make sure we target a specific editor, not all that may be on a page
      // get referenece to the created editor so that we can add a behaviour
      // and so that clearData() has a target
      this.localEditor = await CKEditor.create(
        document.querySelector(`#${this.editorID}`),
        this.ckeConfig
      );

      // Add behaviour to pass text to host component
      this.localEditor.model.document.on('change', () => {
        // this.textToEdit = JSON.stringify(editor.getData()); // necessary?
        this.textToEditChange.emit(this.localEditor.getData());
      });
    })}
    `;

    this.renderer2.appendChild(this.scriptHost.nativeElement, ckeScriptElement);
  }
}
