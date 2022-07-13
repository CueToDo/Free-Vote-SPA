import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  // https://stackoverflow.com/questions/50968902/angular-service-worker-swupdate-available-not-triggered

  constructor(public swUpdate: SwUpdate) {
    console.log('Service Worker Updates Enabled:', swUpdate.isEnabled);

    if (swUpdate.isEnabled) {
      // interval is milliseconds
      interval(1000 * 60).subscribe(val => {
        console.log('Check', val);
        swUpdate
          .checkForUpdate() // that's all, just periodic check. Subscription will pick up detected changes
          .then(_ => console.log('SW Checking for updates'));
      });
    }
  }

  // Called from app component constructor - sets up the subscription to respond to the periodic checks
  public subscribeToUpdates(): void {
    // https://angular.io/guide/service-worker-communications
    this.swUpdate.versionUpdates.subscribe(evt => {
      console.log('Update:', evt.type);
      if (evt.type == 'VERSION_READY') {
        // Downloaded and ready to install
        this.promptUser();
      }
    });
  }

  // No user prompt - JFDI
  private promptUser(): void {
    console.log('Updating to new version');
    this.swUpdate.activateUpdate().then(() => document.location.reload());
  }
}
