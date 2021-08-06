import { components } from './schema';
import * as faker from 'faker';

export function PlaceList(): components['schemas']['PlaceList'] {
  const places = [];

  for (let i = 0; i < 50; i++) {
    places.push(PlaceInfo());
  }

  return {
    places,
  };
}

export function PlaceInfo(
  placeId?: string
): components['schemas']['PlaceInfo'] {
  return {
    placeId: placeId ?? faker.random.word(),
    building: faker.random.word(),
    operator: faker.random.word(),
    city: faker.address.city(),
    address: faker.address.streetAddress(),
    province: faker.address.county(),
    region: faker.address.county(),
    lat: faker.address.latitude(),
    lon: faker.address.longitude(),
    accessPoints: randomAccessPoint(),
  };
}
function randomAccessPoint(): components['schemas']['AccessPoint'][] {
  const howMany = faker.datatype.number(10);
  const items: components['schemas']['AccessPoint'][] = [];

  for (let i = 0; i < howMany; i++) {
    items.push({
      ideCode: faker.random.word(),
      installationDate: faker.datatype
        .number({ min: 2000, max: 2021 })
        .toString(),
      frequencies: '2.4 ghz e 5 ghz',
    });
  }
  return items;
}
