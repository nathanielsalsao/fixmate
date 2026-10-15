from app.domain.users import Customer, Provider, Admin


def display_dashboard(user):
    print(f"{user.name}: {user.dashboard_summary()}")


users = [
    Customer("Alex", "alex@example.com"),
    Provider("Jamie", "jamie@example.com"),
    Admin("Nathan", "nathan@example.com"),
]

for user in users:
    display_dashboard(user)
