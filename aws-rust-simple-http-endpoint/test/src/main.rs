
use lambda_http::{handler, lambda, IntoResponse, Request, Context};
use serde_json::json;

type Error = Box<dyn std::error::Error + Sync + Send + 'static>;

#[tokio::main]
async fn main() -> Result<(), Error> {
    lambda::run(handler(test)).await?;
    Ok(())
}


async fn test(_: Request, _: Context) -> Result<impl IntoResponse, Error> {
	
	
    // `serde_json::Values` impl `IntoResponse` by default
    // creating an application/json response
    Ok(json!({
        "message": "Serverless Rust Hello"
    }))
}

/*
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_handles() {
        let request = Request::default();
        let expected = json!({
        "message": "Serverless Rust Hello"
        })
        .into_response();
        let response = test(request, Context::default())
            .await
            .expect("expected Ok(_) value")
            .into_response();
        assert_eq!(response.body(), expected.body())
    }
}
*/
