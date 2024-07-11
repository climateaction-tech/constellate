import json
import logging

import pytest
from django.conf import settings


from .. import importers

logger = logging.getLogger(__file__)
logger.setLevel(logging.INFO)


@pytest.fixture
def airtable_dummy_user():
    return {
        "id": "recs9I1teiTi4YGlT",
        "createdTime": "2019-10-14T17:47:10.000Z",
        "fields": {
            "Climate Interests": [
                "Environmental justice",
                "Energy",
                "New technology",
                "Activism",
            ],
            "LinkedIn URL": "https://www.linkedin.com/in/mrchrisadams/",
            "Email address": "chris@productscience.net",
            "Specific skills": [
                "Python",
                "SQL",
                "JavaScript",
                "Ansible",
                "Community building",
            ],
            "Location": "Berlin, DE (but anywhere train goes, really)",
            "Moderation status": ["Approved"],
            "Bio": "I am an organiser of CAT, and preoccupied with decoupling the cool bits of tech, from the crap bits of tech, like us using fossil fuels needlessly, and not questioning the unintended impacts we have",
            "Offers": ["Strategic advice", "Mentoring"],
            "Twitter": "mrchrisadams",
            "Areas of focus": ["DevOps", "Web development", "Product", "UX design"],
            "Slack name": "Chris Adams",
            "Asks": ["Volunteers", "Funding", "Consulting"],
            "Date added to directory": "2019-10-14",
            "Record created time": "2019-10-14T17:47:10.000Z",
            "Date updated": "2024-03-17",
        },
    }


@pytest.fixture
def users_from_airtable() -> list[dict]:
    """
    Return a list of airtable directory profiles as returned by calling
    `fetch_data_from_airtable()` on the CATAirtableImporter against the
    expected Airtable
    """
    # assuming you have sample local data
    local_airtable_data = settings.PROJECT_DIR / "data" / "airtable-directory.json"
    users = []

    with open(local_airtable_data) as airtable_json:
        data = airtable_json.read()
        users.extend(json.loads(data))

    return users


class TestCATAirTableImporter:

    # this is just a sanity check to compare:
    # a) actual data we can pull down from the CAT directory Airtable Base, to
    # b) the dummy data we are using
    #
    # We don't run this each time but uncommenting it and running in the test suite
    # ensures we are still using realistic dummy data for our tests
    @pytest.mark.skip(
        reason="Used to sanity check dummy data against actual data from Airtable. See the code comments in the test for more."
    )
    def test_dummy_data_matches_airtable(
        self, db, profile_user_factory, users_from_airtable, airtable_dummy_user
    ):
        importer = importers.CATAirtableImporter()
        airtable_data = importer.fetch_data_from_airtable()

        # enumerate through the airtable with an index
        profile_id = airtable_dummy_user["id"]

        assert len(airtable_data) == len(users_from_airtable)
        matching_profile = [atd for atd in airtable_data if profile_id == atd["id"]]

        assert matching_profile

    def test_create_user_from_airtable(self, db, airtable_dummy_user):
        """Test that we add all the tags from the airtable user when creating a user and profile"""
        importer = importers.CATAirtableImporter()

        user = importer.create_user(airtable_dummy_user)
        assert user.email == airtable_dummy_user["fields"]["Email address"]

        tag_names = user.profile.tags.names()
        groupings = [
            "Climate Interests",
            "Specific skills",
            "Areas of focus",
            "Offers",
            "Asks",
        ]

        for grouping in groupings:
            for skill in airtable_dummy_user["fields"][grouping]:
                assert f"{grouping}:{skill}" in tag_names

    def test_update_user_from_airtable(
        self, db, airtable_dummy_user, user_factory, profile_factory
    ):
        """
        Test that we add all the tags and info from the airtable user when creating a user and profile
        """
        importer = importers.CATAirtableImporter()

        user = user_factory.create(email="chris@productscience.net")
        profile = profile_factory.create(user=user)
        assert profile == user.profile

        assert user.email == airtable_dummy_user["fields"]["Email address"]

        importer.update_profile_for_row(airtable_dummy_user)
        profile.refresh_from_db()

        tag_names = user.profile.tags.names()
        groupings = [
            "Climate Interests",
            "Specific skills",
            "Areas of focus",
            "Offers",
            "Asks",
        ]

        # do we have an import_id set so we know we have seen an update?
        assert profile.import_id

        for grouping in groupings:
            for skill in airtable_dummy_user["fields"][grouping]:
                assert f"{grouping}:{skill}" in tag_names
