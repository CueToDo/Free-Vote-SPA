import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  // https://stackoverflow.com/questions/50968902/angular-service-worker-swupdate-available-not-triggered

  constructor(public updates: SwUpdate) {
    console.log('Service Worker Updates Enabled:', updates.isEnabled);

    if (updates.isEnabled) {
      // interval is milliseconds
      interval(1000 * 5).subscribe(val => {
        console.log('Check', val);
        this.checkForUpdates();
      });
    }
  }

  public checkForUpdates(): void {
    // https://angular.io/guide/service-worker-communications
    this.updates.versionUpdates.subscribe(evt => {
      console.log('Update:', evt.type);
      if (evt.type == 'VERSION_READY') {
        this.promptUser();
      }
    });
  }

  private promptUser(): void {
    console.log('Updating to new version');
    this.updates.activateUpdate().then(() => document.location.reload());
  }
}
