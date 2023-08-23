# Generated by Django 4.1.10 on 2023-07-09 18:20

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0013_catjoinrequest_alter_cluster_slug_and_more"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="catjoinrequest",
            index=models.Index(
                fields=["email", "joined_at"], name="users_catjo_email_df64da_idx"
            ),
        ),
    ]