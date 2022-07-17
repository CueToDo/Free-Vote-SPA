// Angular
import {
  Component,
  OnInit,
  Inject,
  Renderer2,
  PLATFORM_ID,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-cke-universal',
  templateUrl: './cke-universal.component.html',
  styleUrls: ['./cke-universal.component.css']
})
export class CkeUniversalComponent implements OnInit {
  // https://www.lavalamp.biz/blogs/how-to-use-ckeditor-5-in-angular-with-server-side-rendering-support/
  // https://stackoverflow.com/questions/62076412/angular-universal-ckeditor5-window-is-not-defined

  @Input() textToEdit = '';
  @Output() textToEditChange = new EventEmitter();

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
        'image',
        '|',
        'undo',
        'redo'
      ],
      shouldNotGroupWhenFull: true
    },
    // htmlEncodeOutput: false
    allowedContent: true
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: Document,
    private renderer2: Renderer2
  ) {}

  ngOnInit(): void {
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

    const script = this.renderer2.createElement('script');

    script.type = 'application/javascript';

    // script.src = 'https://cdn.ckeditor.com/ckeditor5/12.4.0/classic/ckeditor.js';
    // Use my custom build
    script.src = 'https://free.vote/assets/ckeditor.js';

    script.text = `
    ${(script.onload = async () => {
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

    this.renderer2.appendChild(this.document.body, script);
  }
}
