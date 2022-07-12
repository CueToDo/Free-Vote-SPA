import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  // https://stackoverflow.com/questions/50968902/angular-service-worker-swupdate-available-not-triggered

  constructor(public updates: SwUpdate) {
    console.log('Updates enabled 14.0.10', updates.isEnabled);

    if (updates.isEnabled) {
      // interval is milliseconds
      interval(1000 * 60).subscribe(() =>
        updates.checkForUpdate().then(() => console.log('checking for updates'))
      );
    }
  }

  public checkForUpdates(): void {
    this.updates.versionUpdates.subscribe(_ => this.promptUser());
  }

  private promptUser(): void {
    console.log('updating to new version');
    this.updates.activateUpdate().then(() => document.location.reload());
  }
}
