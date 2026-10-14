"""Processes the jobs the HTTP API puts on the queue."""
import json


def process(event, context):
    failures = []
    for record in event.get("Records", []):
        try:
            job = json.loads(record["body"])
            if not (
                isinstance(job, dict)
                and isinstance(job.get("id"), str)
                and isinstance(job.get("task"), str)
            ):
                raise ValueError("a job is an object with a string id and a string task")
            words = len(job["task"].split())
            print(f"job {job['id']}: {words} words")
        except (KeyError, TypeError, ValueError) as error:
            # Reported per message, so only this one goes back to the queue.
            print(f"message {record['messageId']} is not a job: {error}")
            failures.append({"itemIdentifier": record["messageId"]})
    return {"batchItemFailures": failures}
