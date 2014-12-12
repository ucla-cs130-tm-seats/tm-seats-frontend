from django.contrib import admin
from ticketmaster.models import Segment,Seat,User

class SeatAdmin(admin.ModelAdmin):
    fields = ['position']
    search_fields = ['position']
admin.site.register(Seat, SeatAdmin)
admin.site.register(Segment)
admin.site.register(User)
# Register your models here.
