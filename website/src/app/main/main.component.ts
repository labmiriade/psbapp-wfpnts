import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AppState } from '../store/reducers';
import { searchKeywords } from '../store/selectors/main.selector';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  q: string = '';
  sub = new Subscription();
  constructor(private router: Router, private store: Store<AppState>) {
    this.sub.add(
      this.store.select(searchKeywords()).subscribe((keys) => {
        //this.q = keys.key;
      })
    );
  }

  onSearchClick(event: { q: string; geo: boolean }): void {
    this.router.navigate(['/search'], {
      queryParams: {
        q: event.q,
        geo: event.geo ? '1' : '0',
      },
    });
  }
}
