import * as cdk from "@aws-cdk/core";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";
import * as logs from "@aws-cdk/aws-logs";
import * as dynamo from "@aws-cdk/aws-dynamodb";
import { OpenAPI } from "./open-api";
import { JsonSchema } from "@aws-cdk/aws-apigateway";

export interface ApiGatewayConstructProps {
  /**
   * Function per la ricerca di places
   */
  searchLambda: lambda.IFunction;
  /**
   * DynamoDB Table con i dati
   */
  dataTable: dynamo.Table;
}

/**
 * Construct per la creazione delle risorse legate all'API Gateway.
 *
 * Le funzioni lambda vengono passate al costrutture tramite `props`, mentre le integrazioni
 * di tipo AWS (chiamate dirette a DynamoDB) vengono costruite qui.
 */
export class ApiGatewayConstruct extends cdk.Construct {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: ApiGatewayConstructProps
  ) {
    super(scope, id);

    // L'API Gateway che servirà l'API.
    const api = new apigw.RestApi(this, "Gateway", {
      deployOptions: {
        description: "Stage di default",
        loggingLevel: apigw.MethodLoggingLevel.INFO,
        stageName: "api",
        dataTraceEnabled: true,
        metricsEnabled: true,
      },
      deploy: true,
      description: "Pasubio App WfPnts API",
      endpointTypes: [apigw.EndpointType.EDGE],
      minimumCompressionSize: 0,
    });

    // ruolo utilizzato dalle integrazioni che fanno query (sola lettura) a dataTable
    const dataTableReadWriteRole = new iam.Role(this, "TableQueryRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
    props.dataTable.grantReadWriteData(dataTableReadWriteRole);

    // integration per ottenere le Place Info
    const getPlaceInteg = new apigw.AwsIntegration({
      service: "dynamodb",
      action: "GetItem",
      options: {
        credentialsRole: dataTableReadWriteRole,
        requestTemplates: {
          "application/json": JSON.stringify({
            TableName: props.dataTable.tableName,
            Key: {
              pk: { S: "p-$input.params('placeId')" },
              sk: { S: "p-info" },
            },
            ConsistentRead: false,
          }),
        },
        passthroughBehavior: apigw.PassthroughBehavior.NEVER,
        integrationResponses: [
          {
            statusCode: "200",
            responseTemplates: {
              "application/json": placeInfoResponseTemplate,
            },
          },
          {
            selectionPattern: "404",
            statusCode: "404",
            responseTemplates: {
              "application/json": `$input.params('placeId') not found`,
            },
          },
        ],
      },
    });

    // creo la risorsa `/p`
    const p = api.root.addResource("p");
    // creo la risorsa `/p/{placeId}`
    const placeId = p.addResource("{placeId}");
    // creo il metodo `GET /p/{placeId}`
    placeId.addMethod("GET", getPlaceInteg, {
      // configuro la risposta della API
      methodResponses: [
        {
          statusCode: "200",
          responseModels: {
            // 'application/json': new apigw.Model(this, 'PlaceInfoModel', {
            //   restApi: api,
            //   // importo lo schema dal file OpenAPI
            //   schema: <JsonSchema>OpenAPI.components.schemas.PlaceInfo,
            //   modelName: 'PlaceInfo',
            // }),
            "application/json": apigw.Model.EMPTY_MODEL,
          },
        },
        {
          statusCode: "404",
          responseModels: {
            "application/json": apigw.Model.ERROR_MODEL,
          },
        },
      ],
      requestModels: {
        "application/json": apigw.Model.EMPTY_MODEL,
      },
      requestParameters: {
        "method.request.path.placeId": true,
      },
    });

    ///// SEARCH API

    // integration per cercare un posto
    const searchInteg = new apigw.LambdaIntegration(props.searchLambda, {
      proxy: true,
    });

    // creo la risorsa `/search`
    const search = api.root.addResource("search");
    // creo la risorsa `/search/p`
    const searchP = search.addResource("p");
    // creo il metodo `GET /search/p`
    searchP.addMethod("GET", searchInteg, {
      requestParameters: {
        "method.request.querystring.near": false,
        "method.request.querystring.q": false,
      },
    });

    this.restApi = api;
    this.stage = api.deploymentStage;
  }

  stage: apigw.Stage;
  restApi: apigw.RestApi;
}

const placeInfoResponseTemplate = `
#set( $item = $input.path('$.Item') )
#if ( $item == "" )
#set( $context.responseOverride.status = 444 )
{
  "userMessage": "Non ho trovato il luogo",
  "debugMessage": "Il luogo $input.params('placeId') non esiste"
}
#set( $item = $input.path('$.Item') )
#else
{
  "placeId": "$input.params('placeId')",
  "building": "$util.escapeJavaScript("$item.data.M.building.S").replaceAll("\\'","'")",
  "operator": "$util.escapeJavaScript("$item.data.M.operator.S").replaceAll("\\'","'")",
  "address": "$util.escapeJavaScript("$item.data.M.address.S").replaceAll("\\'","'")",
  "city": "$util.escapeJavaScript("$item.data.M.city.S").replaceAll("\\'","'")",
  "province": "$util.escapeJavaScript("$item.data.M.province.S").replaceAll("\\'","'")",
  "region": "$util.escapeJavaScript("$item.data.M.region.S").replaceAll("\\'","'")",
  "lat": "$util.escapeJavaScript("$item.data.M.lat.S").replaceAll("\\'","'")",
  "lon": "$util.escapeJavaScript("$item.data.M.lon.S").replaceAll("\\'","'")",
  "accessPoints":[
    #foreach($accessPoint in $item.data.M.accessPoints.L)
    {
      "ideCode": "$util.escapeJavaScript("$accessPoint.M.ideCode.S").replaceAll("\\'","'")",
      "installationDate": "$util.escapeJavaScript("$accessPoint.M.installationDate.S").replaceAll("\\'","'")",
      "frequencies": "$util.escapeJavaScript("$accessPoint.M.frequencies.S").replaceAll("\\'","'")"
      }#if($foreach.hasNext),#end
    #end
  ],
  "searchable":"$item.data.M.searchable.BOOL"
}
#end
`;
