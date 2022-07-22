import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { PlaceInfo } from 'src/app/core/interfaces/api.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/reducers';
import { searchKeywords, searchPlace, searchPlaceById } from 'src/app/store/selectors/main.selector';
import { Pin } from 'src/app/shared/components/aws-map-viewer/aws-map-viewer.component';
import { map, take } from 'rxjs/operators';
import * as maplibregl from 'maplibre-gl';
import { searchById, searchFailedById } from 'src/app/store/actions/main.actions';
import { Location } from '@angular/common';
import { Actions, ofType } from '@ngrx/effects';
import { ToastService, ToastType } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  placeId: string;
  place$?: Observable<PlaceInfo | undefined>;
  mapPin: Observable<Pin[]> | undefined;

  constructor(
    private action$: Actions,
    private router: Router,
    private toast: ToastService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private store: Store<AppState>,
  ) {
    this.sub = new Subscription();
    this.placeId = '';
  }

  ngOnInit(): void {
    this.sub.add(
      this.activatedRoute.params.subscribe((params) => {
        this.placeId = params.placeId;
        this.place$ = this.store.select(searchPlace(this.placeId));
        this.sub.add(
          this.place$.subscribe((place) => {
            if (place === undefined) {
              this.getPlaceById();
            }
          }),
        );
        this.mapPin = this.getPin();
      }),
    );
  }

  getPlaceById(): void {
    this.store.dispatch(searchById({ placeId: this.placeId }));

    this.place$ = this.store.select(searchPlaceById());

    this.sub.add(
      this.action$.pipe(ofType(searchFailedById)).subscribe((props) => {
        if (props.placeId === this.placeId) {
          this.toast.show('Errore', 'La palestra cercata non esiste', ToastType.Danger);

          this.router.navigate(['/search'], {
            queryParams: {
              q: '',

              geo: '0',
            },
          });
        }
      }),
    );
  }

  get numberPoints(): Observable<number> | undefined {
    return this.place$?.pipe(
      map((place) => {
        let nPoints: number = place?.accessPoints ? place.accessPoints.length : 0;
        return nPoints;
      }),
    );
  }

  get name(): Observable<string> | undefined {
    return this.place$?.pipe(
      map((place) => {
        let ret: string = '';
        if (place?.city) {
          let building: string = place.building ? ' - ' + place.building : '';
          ret = place.city + building;
        }
        return ret;
      }),
    );
  }
  get address(): Observable<string> | undefined {
    return this.place$?.pipe(
      map((place) => {
        let ret: string = '';
        if (place?.address) {
          let city: string = place.city ? ', ' + place.city : '';
          ret = place.address + city;
        }
        return ret;
      }),
    );
  }

  get province(): Observable<string> | undefined {
    return this.place$?.pipe(
      map((place) => {
        let ret: string = '';
        if (place?.province) {
          let region: string = place.region ? ', ' + place.region : '';
          ret = place.province + region;
        }
        return ret;
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getPin(): Observable<Pin[]> | undefined {
    return this.place$?.pipe(
      map((place) => {
        let pins: Pin[] = [];
        if (place?.lat !== undefined && place?.lon !== undefined && place.lat !== '' && place.lon !== '') {
          const pin: maplibregl.LngLatLike = [parseFloat(place.lon), parseFloat(place.lat)];
          let mapPin: Pin = {
            pos: pin,
          };
          pins.push(mapPin);
        }
        return pins;
      }),
    );
  }

  onSearchClick() {
    this.sub.add(
      this.store
        .select(searchKeywords())
        .pipe(take(1))
        .subscribe((keys) => {
          this.router.navigate(['/search'], {
            queryParams: {
              q: keys.key,

              geo: keys.geo ? keys.geo : '0',
            },
          });
        }),
    );
  }
}
