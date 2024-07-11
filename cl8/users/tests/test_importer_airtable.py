import json
import logging
import pathlib
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
            "Email address": "chris@productscience.topleveldomain",
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
    expected Airtable Base.
    """
    # assuming you have sample local data
    local_airtable_data = settings.PROJECT_DIR / "data" / "airtable-directory.json"
    users = []

    with open(local_airtable_data) as airtable_json:
        data = airtable_json.read()
        users.extend(json.loads(data))

    return users


class TestCATAirTableImporter:

    @pytest.mark.skip(
        reason="Only used to sanity check dummy data against actual data from Airtable. See the code comments in the test for more."
    )
    def test_dummy_data_matches_airtable(
        self, db, profile_user_factory, users_from_airtable, airtable_dummy_user
    ):
        # this is just a sanity check to compare:
        #
        # a) actual data we can pull down from the CAT directory Airtable Base, to
        # b) the dummy data we are using for tests.
        #
        # We don't run this each test run. Uncommenting it and running in the test suite
        # ensures we are still using realistic dummy data for our tests

        importer = importers.CATAirtableImporter()
        airtable_data = importer.fetch_data_from_airtable()

        profile_id = airtable_dummy_user["id"]

        # we should have the same number of profiles in our dummy data
        # as we have in the actual data
        # assert len(airtable_data) == len(users_from_airtable)
        # we should have the dummy profile in the actual data
        matching_profile = [atd for atd in airtable_data if profile_id == atd["id"]]

        # test that every key in atd also exists in airtable_dummy_user
        for atd in matching_profile:
            for key in atd["fields"]:
                assert key in airtable_dummy_user["fields"]

        # test that for every set of tags the values are also the
        # same between the two as well
        for key, value in airtable_dummy_user["fields"].items():
            if isinstance(value, list):
                assert atd["fields"][key] == value

    @pytest.mark.skip(
        reason="Only used to fetch a local dump of data for checking dummy data against actual data from Airtable."
    )
    def test_dump_data_to_json(self):
        """
        Test that we can dump the airtable data to a local json file
        """
        # This is used to fetch a local cache of data in case we need to update
        # our code to match changes to the real data, rather than writing
        # tests and code against incorrect dummy data
        importer = importers.CATAirtableImporter()
        local_airtable_data = settings.PROJECT_DIR / "data" / "airtable-directory.json"

        # do we already have a local cache of the data? It might be stale - fail the test.
        assert not pathlib.Path(local_airtable_data).exists()

        importer.dump_data_to_json_file()
        assert pathlib.Path(local_airtable_data).exists()

        # assert that the parsed json data is a list of dicts as expected
        with open(local_airtable_data) as airtable_json:
            data = airtable_json.read()
            assert isinstance(json.loads(data), list)

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
