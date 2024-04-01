import { Pipe, PipeTransform } from '@angular/core';

// https://angular.io/guide/pipes
@Pipe({
    name: 'TagDisplay',
    standalone: true
})
export class TagDisplayPipe implements PipeTransform {
  transform(value: string): string {
    return value?.split('-').join('&nbsp;').split(' ').join('&nbsp;');
  }
}
