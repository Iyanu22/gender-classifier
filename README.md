# Gender Classifier API

A REST API that classifies names by gender using the Genderize.io API.

## Live URL
https://gender-classifier-5277.onrender.com

## Endpoint
GET /api/classify?name={name}

## Example Request
GET https://gender-classifier-5277.onrender.com/api/classify?name=John

## Example Response
{
  "status": "success",
  "data": {
    "name": "John",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 165452,
    "is_confident": true,
    "processed_at": "2026-04-16T21:00:00.000Z"
  }
}

## Error Responses
| Status | Reason |
|--------|--------|
| 400 | Missing or empty name parameter |
| 422 | Name must be a string |
| 502 | Genderize API error |
| 500 | Internal server error |

## Tech Stack
- Node.js
- Express