
use serde_json::json;

fn main() {

    // creating an application/json response
    println!("{}", json!({
        "message": "Serverless Rust Hello"
    }))
}



