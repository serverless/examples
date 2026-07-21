use lambda_http::{run, service_fn, Body, Error, Request, Response};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(test)).await
}

async fn test(_event: Request) -> Result<Response<Body>, Error> {
    // `serde_json::Value` is turned into a JSON response body below.
    let payload = json!({
        "message": "Serverless Rust Hello"
    });

    let response = Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .body(Body::from(payload.to_string()))
        .map_err(Box::new)?;

    Ok(response)
}

#[cfg(test)]
mod tests {
    use super::*;
    use lambda_http::http::StatusCode;

    #[tokio::test]
    async fn test_handles() {
        let request = Request::default();
        let response = test(request).await.expect("expected Ok(_) value");
        assert_eq!(response.status(), StatusCode::OK);
    }
}
