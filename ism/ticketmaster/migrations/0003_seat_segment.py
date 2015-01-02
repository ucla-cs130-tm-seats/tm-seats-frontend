# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ticketmaster', '0002_auto_20141204_0606'),
    ]

    operations = [
        migrations.AddField(
            model_name='seat',
            name='segment',
            field=models.CharField(default=0, max_length=60),
            preserve_default=False,
        ),
    ]
