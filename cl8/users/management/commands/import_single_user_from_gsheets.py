import logging

from django.core.management import BaseCommand

from cl8.users.importers import EmptyJoinRequestCAT, import_user_from_gsheet

logger = logging.getLogger(__name__)
console = logging.StreamHandler()
console.setLevel(logging.DEBUG)
logger.addHandler(console)
logger.setLevel(logging.DEBUG)


class Command(BaseCommand):
    help = "Import a single user profile into this constellation"

    #  add required argument of a single email address to the management command
    def add_arguments(self, parser):
        parser.add_argument("email", type=str, help="email address of user to import")

    def handle(self, *args, **options):
        # pull email out of args passed in as option on command line
        email = options["email"]

        matching_row = import_user_from_gsheet(email)
