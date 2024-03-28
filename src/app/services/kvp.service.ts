// Angular
import { Injectable } from '@angular/core';

// Models
import { Kvp } from 'src/app/models/kvp.model';

@Injectable({
  providedIn: 'root'
})
export class KvpService {
  constructor() {}

  ArrayOfKVP(source: any): Array<Kvp> {
    const output = new Array<Kvp>();
    for (const kvp of source) {
      output.push({ key: kvp.key, value: kvp.value } as Kvp);
    }
    return output;
  }

  // Value ID is a number
  GetKVPValue(source: Array<Kvp>, key: string): number {
    const kvp = source.find(element => element.key === key);
    if (kvp) {
      return kvp.value;
    } else {
      return -1;
    }
  }

  /// Key Display is a string
  GetKVPKey(source: Array<Kvp>, value: number): string {
    const kvp = source.find(element => element.value === value);
    if (kvp) {
      return kvp.key;
    } else {
      return '';
    }
  }
}
