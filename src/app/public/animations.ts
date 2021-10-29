import {
  trigger,
  transition,
  style,
  animate,
  state
} from '@angular/animations';

export const burgerMenuTrigger = trigger('burgerMenu', [
  state('show', style({})),
  state(
    'hide',
    style({
      height: 0
    })
  ),
  transition('show <=> hide', [animate('300ms ease-out')])
]);
