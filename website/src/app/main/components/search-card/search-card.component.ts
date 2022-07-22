import { Input, Component, Output, EventEmitter } from '@angular/core';
import { PlaceInfo } from 'src/app/core/interfaces/api.interface';

@Component({
  selector: 'app-search-card',
  templateUrl: './search-card.component.html',
  styleUrls: ['./search-card.component.scss'],
})
export class SearchCardComponent {
  @Input() place?: PlaceInfo;
  @Output() placeClick = new EventEmitter<PlaceInfo>();

  get name(): string {
    if (this.place?.city) {
      let building: string = this.place.building ? ' - ' + this.place.building : '';
      return this.place.city + building;
    } else {
      return '';
    }
  }

  get city(): string {
    if (this.place?.city) {
      let address: string = this.place.address ? ', ' + this.place.address : '';
      return this.place.city + address;
    } else {
      return '';
    }
  }

  get province(): string {
    if (this.place?.province) {
      let region: string = this.place.region ? ', ' + this.place.region : '';
      return this.place.province + region;
    } else {
      return '';
    }
  }

  onSelectClick(): void {
    this.placeClick.emit(this.place);
  }
}
