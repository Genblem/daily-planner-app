from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from .models import Entry
from .serializers import EntrySerializer


class EntryViewSet(viewsets.ModelViewSet):
    serializer_class = EntrySerializer
    queryset = Entry.objects.all()

    def get_queryset(self):
        qs = Entry.objects.all()
        date = self.request.query_params.get('date')
        category = self.request.query_params.get('category')
        if date:
            qs = qs.filter(date=date)
        if category:
            qs = qs.filter(category=category)
        return qs

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        date = request.query_params.get('date')
        if not date:
            return Response({'error': 'date param required'}, status=400)

        entries = Entry.objects.filter(date=date)

        calories = entries.filter(category='food').aggregate(
            total=Sum('calories'))['total'] or 0

        water = entries.filter(category='water').aggregate(
            total=Sum('amount_ml'))['total'] or 0

        exercise_mins = entries.filter(category='exercise').aggregate(
            total=Sum('duration_minutes'))['total'] or 0

        meds = entries.filter(category='medication')
        meds_total = meds.count()
        meds_taken = meds.filter(taken=True).count()

        sleep = entries.filter(category='sleep').first()
        sleep_hours = float(sleep.sleep_hours) if sleep and sleep.sleep_hours else None

        mood_entry = entries.filter(category='mood').first()
        mood = mood_entry.mood if mood_entry else None

        return Response({
            'date': date,
            'calories': calories,
            'water_ml': water,
            'exercise_minutes': exercise_mins,
            'medications': {'total': meds_total, 'taken': meds_taken},
            'sleep_hours': sleep_hours,
            'mood': mood,
            'entry_counts': {
                cat: entries.filter(category=cat).count()
                for cat in ['food', 'medication', 'exercise', 'water', 'sleep', 'mood']
            }
        })
