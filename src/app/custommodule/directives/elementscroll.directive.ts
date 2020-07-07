import {
  Directive,
  Output,
  EventEmitter,
  NgZone,
  HostListener
} from '@angular/core';

// https://stackoverflow.com/questions/44634992/debounce-hostlistener-event
export function Debounce(delay: number = 300): MethodDecorator {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

    const original = descriptor.value;
    const key = `__timeout__${propertyKey}`;

    descriptor.value = function (...args) {
      clearTimeout(this[key]);
      this[key] = setTimeout(() => original.apply(this, args), delay);
    };

    return descriptor;
  };
}

@Directive({
  selector: '[appElementScrollEnd]'
})
export class ElementScrollDirective {
  @Output() scrollEnd = new EventEmitter();

  constructor(private ngZone: NgZone) { }

  @HostListener('scroll', ['$event.target'])
  @Debounce()
  onScroll(elem) {

    if (elem.offsetHeight + elem.scrollTop >= 0.99 * elem.scrollHeight) {
      // https://angular.io/api/core/NgZone#runy
      this.ngZone.run(() => {
        this.scrollEnd.emit();
      });
      // Is this necessary because the points is in a separate module?
      // No, because you have to run change detection on ngZone after runOutsideAngular
    }
  }
}
