// Angular
import { Injectable } from '@angular/core';

// Models
import { ID } from 'src/app/models/common';

@Injectable({
  providedIn: 'root'
})
export class BasicService {
  constructor() {}

  public ordinal(i: number): string {
    const j = i % 10;
    const k = i % 100;
    if (j === 1 && k !== 11) {
      return i + 'st';
    }
    if (j === 2 && k !== 12) {
      return i + 'nd';
    }
    if (j === 3 && k !== 13) {
      return i + 'rd';
    }
    return i + 'th';
  }

  public plural(i: number): string {
    switch (i) {
      case 1:
        return '';
      default:
        return 's';
    }
  }

  isConsonant(ch: string): boolean {
    if (!ch) {
      return false;
    }

    // To handle lower case
    ch = ch[0].toUpperCase();

    return (
      ch.charCodeAt(0) >= 65 &&
      ch.charCodeAt(0) <= 90 &&
      !(ch == 'A' || ch == 'E' || ch == 'I' || ch == 'O' || ch == 'U')
    );
  }

  uniqueConsonants(word: string): number {
    if (!word) {
      return 0;
    }

    let consonants: string[] = [];
    let c = '';

    for (let i = 0; i < word.length; i++) {
      c = word[i];
      if (this.isConsonant(c) && consonants.indexOf(c) < 0) {
        consonants.push(c);
      }
    }
    return consonants.length;
  }

  public removeBookEnds(withEnds: string, removeEnd: string): string {
    // filter - an empty string evaluates to boolean false. It works with all falsy values like 0, false, null, undefined
    return withEnds
      .split(removeEnd)
      .filter(item => item)
      .join(removeEnd);
  }

  GetMapValue(obj: any, key: string): string {
    if (obj.hasOwnProperty(key)) {
      return obj[key];
    }
    throw new Error('Invalid map key.');
  }

  CastObjectToIDs(sourceObject: any): ID[] {
    // construct an Array of objects from an object
    return Object.keys(sourceObject).map(key => {
      return { rowNumber: Number(key), id: sourceObject[key] };
    });
  }

  // DO NOT WORK WITH Map
  // https://stackoverflow.com/questions/48187362/how-to-iterate-using-ngfor-loop-map-containing-key-as-string-and-values-as-map-i

  // Do Not Use map
  // ArrayFromMap(map: Map<number, string>): any[] {
  //   return Array.from(map.entries()).map(([key, val]) => ({ key, val }));
  // }

  // https://blog.logrocket.com/4-different-techniques-for-copying-objects-in-javascript-511e422ceb1e/
  // We call the copy shallow because the properties in the target object
  // can still hold references to those in the source object. WTF

  // Now using lodash for deep copy and potentially other methods to manuipulate objects and arrays

  // deep<T>(value: T): T | any[] {
  //   if (typeof value !== 'object' || value === null) {
  //     return value;
  //   }
  //   if (Array.isArray(value)) {
  //     return this.deepArray(value as any[]);
  //   }
  //   return this.deepObject(value);
  // }

  // deepArray<T extends any[]>(collection: T): any[] {
  //   return collection.map((value) => {
  //     return this.deep(value);
  //   });
  // }

  // deepObject<T>(source: T): T {
  //   const result = {};
  //   Object.keys(source).forEach((key) => {
  //     const value = source[key];
  //     result[key] = this.deep(value);
  //   }, {});
  //   return result as T;
  // }
}
