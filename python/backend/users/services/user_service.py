from typing import Optional
import uuid
from users.repositories import UserRepository
from users.dtos import RegisterDTO, UpdateUserDTO, UserResponseDTO
from core.exceptions import ConflictException, NotFoundException, ValidationException


class UserService:
    def __init__(self, repository: Optional[UserRepository] = None):
        self._repo = repository or UserRepository()

    def register(self, dto: RegisterDTO) -> UserResponseDTO:
        errors = dto.validate()
        if errors:
            raise ValidationException(errors)
        if self._repo.exists_by_email(dto.email):
            raise ConflictException(f"Email '{dto.email}' is already registered.")
        user = self._repo.create(
            name=dto.name,
            email=dto.email,
            password=dto.password,
            phone=dto.phone,
        )
        return UserResponseDTO.from_model(user)

    def get_user(self, user_id: uuid.UUID) -> UserResponseDTO:
        user = self._repo.get_by_id(user_id)
        if not user:
            raise NotFoundException(f"User '{user_id}' not found.")
        return UserResponseDTO.from_model(user)

    def get_all_users(self) -> list[UserResponseDTO]:
        return [UserResponseDTO.from_model(u) for u in self._repo.get_all()]

    def update_user(self, user_id: uuid.UUID, dto: UpdateUserDTO) -> UserResponseDTO:
        user = self._repo.get_by_id(user_id)
        if not user:
            raise NotFoundException(f"User '{user_id}' not found.")
        updated = self._repo.update(user, name=dto.name, phone=dto.phone)
        return UserResponseDTO.from_model(updated)

    def delete_user(self, user_id: uuid.UUID) -> None:
        user = self._repo.get_by_id(user_id)
        if not user:
            raise NotFoundException(f"User '{user_id}' not found.")
        self._repo.delete(user)
