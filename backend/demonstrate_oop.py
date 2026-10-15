from app.database.mongodb import get_database
from app.domain.home_services import (
    HomeService,
    CleaningService,
    PlumbingService,
    GeneralHomeService,
)

db = get_database()

documents = list(
    db.services.find({"is_active": True}).sort("name", 1)
)

if not documents:
    print("No active services found in MongoDB.")
    raise SystemExit(0)

for document in documents:
    service = HomeService.from_document(document)

    print(f"\nService: {service.service_name}")
    print(f"Category: {service.category}")
    print(f"MongoDB ID: {service.service_id}")
    print(f"Python class: {type(service).__name__}")
    print(f"Base price: PHP {service.base_price:.2f}")
    print(f"Calculated price: PHP {service.calculate_price():.2f}")
    print(f"Is a HomeService: {isinstance(service, HomeService)}")



