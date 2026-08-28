from app.repositories.homepage_repository import HomepageRepository


class HomepageService:

    def __init__(self, homepage_repo: HomepageRepository):
        self.homepage_repo = homepage_repo

    def get_content(self):
        return self.homepage_repo.get_content()

    def update_content(self, data):
        return self.homepage_repo.update_content(data.dict())
