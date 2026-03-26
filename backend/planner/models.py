from django.db import models

CATEGORY_CHOICES = [
    ('food', 'Food'),
    ('medication', 'Medication'),
    ('exercise', 'Exercise'),
    ('water', 'Water'),
    ('sleep', 'Sleep'),
    ('mood', 'Mood'),
]

MOOD_CHOICES = [
    ('great', 'Great'),
    ('good', 'Good'),
    ('okay', 'Okay'),
    ('bad', 'Bad'),
    ('terrible', 'Terrible'),
]


class Entry(models.Model):
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    date = models.DateField()
    time = models.TimeField(null=True, blank=True)
    title = models.CharField(max_length=200)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Food fields
    calories = models.PositiveIntegerField(null=True, blank=True)
    meal_type = models.CharField(max_length=20, blank=True, default='',
                                  choices=[('breakfast','Breakfast'),('lunch','Lunch'),
                                           ('dinner','Dinner'),('snack','Snack')])

    # Medication fields
    dosage = models.CharField(max_length=100, blank=True, default='')
    taken = models.BooleanField(default=False)

    # Exercise fields
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    intensity = models.CharField(max_length=10, blank=True, default='',
                                  choices=[('low','Low'),('medium','Medium'),('high','High')])

    # Water field (ml)
    amount_ml = models.PositiveIntegerField(null=True, blank=True)

    # Sleep field (hours)
    sleep_hours = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)

    # Mood field
    mood = models.CharField(max_length=20, blank=True, default='', choices=MOOD_CHOICES)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f'[{self.category}] {self.title} on {self.date}'
