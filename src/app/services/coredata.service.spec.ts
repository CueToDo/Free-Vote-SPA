import { TestBed, inject } from '@angular/core/testing';

import { CoreDataService } from './coredata.service';

describe('CoreDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoreDataService]
    });
  });

  it('should be created', inject([CoreDataService], (service: CoreDataService) => {
    expect(service).toBeTruthy();
  }));
});
