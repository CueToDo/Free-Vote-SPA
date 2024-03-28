import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpExtraService {
  constructor() {}

  // For groupnames in urls. replace spaces first, then encode
  kebabUri(input: string): string {
    // But not converted to lower case
    // filter - an empty string evaluates to boolean false. It works with all falsy values like 0, false, null, undefined
    let output = '';

    if (input) {
      // While it's definitely possible to use commas in URLs, it's not a widely used practice, nor is it recommended
      // https://www.searchenginenews.com/sample/content/are-you-using-commas-in-your-urls-heres-what-you-need-to-know
      output = input.replace(',', '');

      output = output
        .split(' ')
        .filter(item => item)
        .join('-'); // remove double spaces, replace spaces with dash

      output = output
        .split('-')
        .filter(item => item)
        .join('-'); // remove double-dashes, no dash start or end

      output = encodeURIComponent(output);
    }

    return output;
  }

  unKebabUri(input: string): string {
    return input
      ?.split('-')
      .filter(item => item)
      .join(' ');
  }

  // Do not use: Name can now include reserved characters (these will be removed from the "slug" for route parameter use)
  isUrlNameUnSafe(input: string): boolean {
    return (
      input.includes('\\') ||
      // input.includes(
      //   '-'
      // ) /* hyphen not allowed as spaces will be represented by hyphens */ ||
      input.includes('?') ||
      input.includes('!') ||
      input.includes(`'`) ||
      input.includes(`,`) ||
      input.includes(':') ||
      input.includes(';') ||
      input.includes('*') ||
      input.includes('/') ||
      input.includes('+') ||
      input.includes('=') ||
      input.includes('@') ||
      input.includes('&') ||
      input.includes('#') ||
      input.includes('$')
    );
  }

  // Not required - names will be "slugged in API"
  urlSafeName(input: string): string {
    let output = input
      .split('\\')
      .filter(item => item)
      .join(''); // no back-slashes
    output = output
      .split('-')
      .filter(item => item)
      .join(
        ' '
      ); /* hyphen not allowed as spaces will be represented by hyphens */
    output = output
      .split('?')
      .filter(item => item)
      .join('');
    output = output
      .split('!')
      .filter(item => item)
      .join('');
    output = output
      .split(`'`)
      .filter(item => item)
      .join('');
    output = output
      .split(',')
      .filter(item => item)
      .join('');
    output = output
      .split(':')
      .filter(item => item)
      .join('');
    output = output
      .split(';')
      .filter(item => item)
      .join('');
    output = output
      .split('*')
      .filter(item => item)
      .join('');
    output = output
      .split('/')
      .filter(item => item)
      .join('');
    output = output
      .split('+')
      .filter(item => item)
      .join('');
    output = output
      .split('=')
      .filter(item => item)
      .join('');
    output = output
      .split('@')
      .filter(item => item)
      .join('');
    output = output
      .split('&')
      .filter(item => item)
      .join('');
    output = output
      .split('#')
      .filter(item => item)
      .join('');
    output = output
      .split('$')
      .filter(item => item)
      .join('');

    return output;
  }
}
