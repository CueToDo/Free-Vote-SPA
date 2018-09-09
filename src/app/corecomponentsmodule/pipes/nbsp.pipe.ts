import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nbsp'
})
export class NbspPipe implements PipeTransform {

  transform(value: string): string {
    return value.split(' ').join('&nbsp;');
  }

}
