import { TestBed, inject } from '@angular/core/testing';

import { LoginRouteGuardService } from './login-route-guard.service';

describe('LoginRouteGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoginRouteGuardService]
    });
  });

  it('should be created', inject([LoginRouteGuardService], (service: LoginRouteGuardService) => {
    expect(service).toBeTruthy();
  }));
});
