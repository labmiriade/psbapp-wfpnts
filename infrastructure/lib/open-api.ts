/**
 * This File is autogenerated by ./bin/openapi-parser.ts
 * Should not be modified.
 */

export const OpenAPI = {
  openapi: '3.0.3',
  info: {
    title: 'PSBAPP WFPNTS API',
    version: '2021-05-27',
  },
  paths: {
    '/p/{placeId}': {
      parameters: [
        {
          in: 'path',
          schema: {
            type: 'string',
          },
          name: 'placeId',
          required: true,
        },
      ],
      get: {
        tags: ['End User'],
        description: 'Ottieni informazioni su un luogo',
        responses: {
          '200': {
            description: 'Informazioni sul luogo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    placeId: {
                      type: 'string',
                    },
                    building: {
                      type: 'string',
                    },
                    operator: {
                      type: 'string',
                    },
                    address: {
                      type: 'string',
                    },
                    city: {
                      type: 'string',
                    },
                    province: {
                      type: 'string',
                    },
                    region: {
                      type: 'string',
                    },
                    lat: {
                      type: 'string',
                    },
                    lon: {
                      type: 'string',
                    },
                    searchable: {
                      type: 'boolean',
                    },
                    accessPoints: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          ideCode: {
                            type: 'string',
                          },
                          installationDate: {
                            type: 'string',
                          },
                          frequencies: {
                            type: 'string',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '444': {
            description: 'Luogo non esistente',
          },
        },
      },
    },
    '/search/p': {
      get: {
        tags: ['End User', 'Search'],
        parameters: [
          {
            name: 'q',
            in: 'query',
            description: 'The text for full text search on all fields',
            required: false,
            schema: {
              type: 'string',
            },
          },
          {
            name: 'near',
            in: 'query',
            description: 'Latitude and longitude for the search',
            required: false,
            schema: {
              type: 'string',
              pattern: '\\d{1,2}(.\\d*)\\,\\d{1,2}(.\\d*)',
            },
          },
        ],
        summary: 'Search places',
        description: "At least one of the 'q' or the 'near' parameters is required",
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    places: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          placeId: {
                            type: 'string',
                          },
                          building: {
                            type: 'string',
                          },
                          operator: {
                            type: 'string',
                          },
                          address: {
                            type: 'string',
                          },
                          city: {
                            type: 'string',
                          },
                          province: {
                            type: 'string',
                          },
                          region: {
                            type: 'string',
                          },
                          lat: {
                            type: 'string',
                          },
                          lon: {
                            type: 'string',
                          },
                          searchable: {
                            type: 'boolean',
                          },
                          accessPoints: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                ideCode: {
                                  type: 'string',
                                },
                                installationDate: {
                                  type: 'string',
                                },
                                frequencies: {
                                  type: 'string',
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      PlaceList: {
        type: 'object',
        properties: {
          places: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                placeId: {
                  type: 'string',
                },
                building: {
                  type: 'string',
                },
                operator: {
                  type: 'string',
                },
                address: {
                  type: 'string',
                },
                city: {
                  type: 'string',
                },
                province: {
                  type: 'string',
                },
                region: {
                  type: 'string',
                },
                lat: {
                  type: 'string',
                },
                lon: {
                  type: 'string',
                },
                searchable: {
                  type: 'boolean',
                },
                accessPoints: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      ideCode: {
                        type: 'string',
                      },
                      installationDate: {
                        type: 'string',
                      },
                      frequencies: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      PlaceInfo: {
        type: 'object',
        properties: {
          placeId: {
            type: 'string',
          },
          building: {
            type: 'string',
          },
          operator: {
            type: 'string',
          },
          address: {
            type: 'string',
          },
          city: {
            type: 'string',
          },
          province: {
            type: 'string',
          },
          region: {
            type: 'string',
          },
          lat: {
            type: 'string',
          },
          lon: {
            type: 'string',
          },
          searchable: {
            type: 'boolean',
          },
          accessPoints: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                ideCode: {
                  type: 'string',
                },
                installationDate: {
                  type: 'string',
                },
                frequencies: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
      AccessPoint: {
        type: 'object',
        properties: {
          ideCode: {
            type: 'string',
          },
          installationDate: {
            type: 'string',
          },
          frequencies: {
            type: 'string',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'End User',
      description: "Chiamate utilizzate dall'end user, non sono autenticate.",
    },
    {
      name: 'Search',
      description: 'Chiamate per cercare i luoghi',
    },
  ],
};
