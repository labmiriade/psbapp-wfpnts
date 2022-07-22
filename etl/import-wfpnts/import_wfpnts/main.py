from smart_open import open
import os
import boto3
import csv
import json
import itertools

from typing import List, Tuple, Set
import traceback

CSV_DATA_URLS = json.loads(os.environ.get("CSV_DATA_URLS"))

dynamodb = boto3.resource("dynamodb")
table_name = os.environ.get("DATA_TABLE")
table = dynamodb.Table(table_name)


def lower_first(iterator):
    return itertools.chain([next(iterator).lower()], iterator)


def lambda_handler(event, context):
    failed_records: List[str] = []
    ids_from_csv = set()

    with table.batch_writer() as batch:
        for CSV_DATA_URL in CSV_DATA_URLS:
            try:
                print(f"START: {CSV_DATA_URL}")
                with open(CSV_DATA_URL) as csvfile:
                    ids_from_csv, failed_records = put_places(csvfile, batch)
                    print(f"Found {len(ids_from_csv)} good records")
                    print(f"Found {len(failed_records)} bad records")
            except Exception as error:
                print(f"ERROR: {CSV_DATA_URL}")
                traceback.print_exc()
                raise error
    if failed_records:
        raise Exception

    place_records = query_places()
    # cerco i record che non esistono nel CSV
    for place_record in place_records:
        id_record = place_record["pk"]["S"]
        if id_record not in ids_from_csv:
            update_place(place_record["pk"]["S"], "false")


def query_places():
    dynamoclient = boto3.client("dynamodb")
    query_params = {
        "TableName": table_name,
        "IndexName": "GSI1",
        "ConsistentRead": False,
        "KeyConditionExpression": "gsi1pk = :place",
        "ExpressionAttributeValues": {
            ":place": {"S": "place"},
        },
    }  # query parameters for paginated results

    response = dynamoclient.query(**query_params)
    return response["Items"]


def update_place(pk, searchable):
    table.update_item(
        Key={"pk": pk, "sk": "p-info"},
        UpdateExpression="SET #data.searchable = :searchable",
        ExpressionAttributeNames={"#data": "data"},
        ExpressionAttributeValues={":searchable": False},
    )


def put_places(csvfile, batch) -> Tuple[Set[str], List[Exception]]:
    """
    Put all places from a csv file in a dynamodb table batch writer
    :param csvfile: the csv file to read data from
    :param batch: the Table write batch to write to
    :return: a tuple with a set of the inserted ids as first element and a list of occurred exceptions as second
    """
    ids = set()
    errors = []
    items = []
    reader = csv.DictReader(lower_first(csvfile), delimiter=";")
    for row in reader:
        # raggruppo i punti wi-fi con uguali coordinate
        lat_long = from_coordinates_to_lat_long(row["coordinate"])
        place_id = lat_long[0] + "-" + lat_long[1]
        dict_indices = [i for i, d in enumerate(items) if d["pk"] == "p-" + place_id]
        # se il nuovo record ha coordinate già presenti in lista, aggiorno il record aggiungendo un nuovo access point alla lista degli access point
        # se il nuovo record ha coordinate non presenti in lista, aggiungo il record alla lista
        if dict_indices:
            items[dict_indices[0]]["data"]["accessPoints"].append(
                {
                    "ideCode": get_or_error(row, "CODICE_IDE"),
                    "installationDate": get_or_error(row, "DATA_ATTIV"),
                    "frequencies": get_or_error(row, "FREQUENZE"),
                }
            )
        else:
            new_item = {
                "pk": "p-" + place_id,
                "sk": "p-info",
                "data": {
                    "placeId": place_id,
                    "building": get_or_error(row, "UBICAZIONE"),
                    "operator": get_or_error(row, "OPERATORE"),
                    "address": get_or_error(row, "INDIRIZZO"),
                    "city": get_or_error(row, "COMUNE"),
                    "province": get_or_error(row, "PROVINCIA"),
                    "region": get_or_error(row, "REGIONE"),
                    "lat": lat_long[0],
                    "lon": lat_long[1],
                    "accessPoints": [
                        {
                            "ideCode": get_or_error(row, "CODICE_IDE"),
                            "installationDate": get_or_error(row, "DATA_ATTIV"),
                            "frequencies": get_or_error(row, "FREQUENZE"),
                        }
                    ],
                    "searchable": True,
                },
                "gsi1pk": "place",
            }
            items.append(new_item)

    for item in items:
        try:
            batch.put_item(Item=item)
            ids.add(item["pk"])
        except Exception as error:
            errors.append(error)
            print(f"error processing {item=} {error=}")
            traceback.print_exc()

    return ids, errors


def get_or_error(item, key):
    key = key.lower()
    try:
        return item[key]
    except KeyError:
        print(f"Missing key: {key}")
    return ""


# from 45N72499411E331095 to [45.724994, 11.331095]
def from_coordinates_to_lat_long(coordinates):
    n = len(coordinates) // 2
    lat_long = []
    i = 0
    coordinates = coordinates.replace("N", ".").replace("E", ".")
    while i < len(coordinates):
        if i + n < len(coordinates):
            lat_long.append(coordinates[i : i + n])  # noqa: E203
        else:
            lat_long.append(coordinates[i : len(coordinates)])  # noqa: E203
        i += n
    return lat_long
