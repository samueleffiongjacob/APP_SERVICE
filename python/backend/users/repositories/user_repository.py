from typing import Optional
import uuid
from django.core.exceptions import ObjectDoesNotExist
from users.models import User


class UserRepository:
    """Repository layer — all ORM access for User lives here."""

    def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        try:
            return User.objects.get(id=user_id)
        except ObjectDoesNotExist:
            return None

    def get_by_email(self, email: str) -> Optional[User]:
        return User.objects.filter(email=email).first()

    def get_all(self) -> list[User]:
        return list(User.objects.all())

    def create(self, name: str, email: str, password: str, phone: str = "") -> User:
        return User.objects.create_user(
            email=email,
            name=name,
            password=password,
            phone=phone,
        )

    def update(self, user: User, **fields) -> User:
        allowed = {k: v for k, v in fields.items() if v is not None}
        for attr, value in allowed.items():
            setattr(user, attr, value)
        user.save(update_fields=list(allowed.keys()) + ["updated_at"])
        return user

    def delete(self, user: User) -> None:
        user.delete()

    def exists_by_email(self, email: str) -> bool:
        return User.objects.filter(email=email).exists()
