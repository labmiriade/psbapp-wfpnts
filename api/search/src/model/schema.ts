/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/p/{placeId}": {
    /** Ottieni informazioni su un luogo */
    get: {
      parameters: {
        path: {
          placeId: string;
        };
      };
      responses: {
        /** Informazioni sul luogo */
        200: {
          content: {
            "application/json": components["schemas"]["PlaceInfo"];
          };
        };
        /** Luogo non esistente */
        444: unknown;
      };
    };
    parameters: {
      path: {
        placeId: string;
      };
    };
  };
  "/search/p": {
    /** At least one of the 'q' or the 'near' parameters is required */
    get: {
      parameters: {
        query: {
          /** The text for full text search on all fields */
          q?: string;
          /** Latitude and longitude for the search */
          near?: string;
        };
      };
      responses: {
        /** OK */
        200: {
          content: {
            "application/json": components["schemas"]["PlaceList"];
          };
        };
      };
    };
  };
}

export interface components {
  schemas: {
    PlaceList: {
      places?: components["schemas"]["PlaceInfo"][];
    };
    PlaceInfo: {
      placeId?: string;
      building?: string;
      operator?: string;
      address?: string;
      city?: string;
      province?: string;
      region?: string;
      lat?: string;
      lon?: string;
      searchable?: boolean;
      accessPoints?: components["schemas"]["AccessPoint"][];
    };
    AccessPoint: {
      ideCode?: string;
      installationDate?: string;
      frequencies?: string;
    };
  };
}

export interface operations {}
