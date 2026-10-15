
class UserProfile:
    def __init__(self, name: str, email: str):
        self.name = name
        self.email = email

    @property
    def email(self):
        return self.__email

    @email.setter
    def email(self, value: str):
        value = value.strip().lower()

        if "@" not in value:
            raise ValueError("Invalid email address")

        self.__email = value
