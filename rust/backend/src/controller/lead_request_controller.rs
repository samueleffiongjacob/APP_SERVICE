use crate::{
    dto::{CreateLeadRequest, LeadRequestResponse},
    error::AppError,
    state::AppState,
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use uuid::Uuid;

pub async fn create_request(
    State(state): State<AppState>,
    Json(payload): Json<CreateLeadRequest>,
) -> Result<impl IntoResponse, AppError> {
    let request = state.lead_request_service.create(payload).await?;
    Ok((StatusCode::CREATED, Json(LeadRequestResponse::from(request))))
}

pub async fn list_requests(
    State(state): State<AppState>,
) -> Result<impl IntoResponse, AppError> {
    let requests: Vec<LeadRequestResponse> = state
        .lead_request_service
        .list()
        .await?
        .into_iter()
        .map(LeadRequestResponse::from)
        .collect();

    Ok(Json(requests))
}

pub async fn delete_request(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    state.lead_request_service.delete(id).await?;
    Ok(StatusCode::NO_CONTENT)
}
