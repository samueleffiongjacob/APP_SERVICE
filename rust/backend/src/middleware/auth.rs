// This is intentionally NOT wired into the router yet.
//
// The current `login` handler issues a random UUID with no signature, no
// expiry, and nothing stored server-side to verify it against later.
// That's fine as a placeholder, but it means there is currently no way to
// write a real `require_auth` middleware: there is no token to validate.
//
// Before protecting any routes with this, you need one of:
//   - a signed token (e.g. JWT via the `jsonwebtoken` crate) that this
//     middleware can verify statelessly, or
//   - a server-side session table (token -> user_id) that this middleware
//     looks up on every request.
//
// Sketch of what this will look like once tokens are real:
//
// use axum::{extract::Request, http::{StatusCode, header}, middleware::Next, response::Response};
//
// pub async fn require_auth(mut req: Request, next: Next) -> Result<Response, StatusCode> {
//     let token = req
//         .headers()
//         .get(header::AUTHORIZATION)
//         .and_then(|h| h.to_str().ok())
//         .and_then(|h| h.strip_prefix("Bearer "))
//         .ok_or(StatusCode::UNAUTHORIZED)?;
//
//     let user_id = verify_token(token).map_err(|_| StatusCode::UNAUTHORIZED)?;
//     req.extensions_mut().insert(user_id);
//     Ok(next.run(req).await)
// }
