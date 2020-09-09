# Generated by Django 3.0.7 on 2020-09-08 21:24

from django.db import migrations, models
import django.db.models.deletion
import taggit.managers


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_auto_20200901_1803'),
    ]

    operations = [
        migrations.CreateModel(
            name='Cluster',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True, verbose_name='name')),
                ('slug', models.SlugField(max_length=100, unique=True, verbose_name='slug')),
            ],
            options={
                'verbose_name': 'Cluster',
                'verbose_name_plural': 'Clusters',
            },
        ),
        migrations.CreateModel(
            name='TaggedCluster',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content_object', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.Profile')),
                ('tag', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='users_taggedcluster_items', to='users.Cluster')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='profile',
            name='clusters',
            field=taggit.managers.TaggableManager(blank=True, help_text='A comma-separated list of tags.', through='users.TaggedCluster', to='users.Cluster', verbose_name='Clusters'),
        ),
    ]
