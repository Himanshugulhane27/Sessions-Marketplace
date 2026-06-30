from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from sessions_app.models import Session

class Command(BaseCommand):
    help = 'Seeds the database with realistic dummy sessions'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # Create a dummy creator if not exists
        creator, created = User.objects.get_or_create(
            username='master_creator',
            defaults={
                'email': 'creator@example.com',
                'name': 'Elena Rostova',
                'role': 'creator',
            }
        )
        if not created and creator.role != 'creator':
            creator.role = 'creator'
            creator.save()

        # Clear old dummy data for idempotency (optional, but good for resetting)
        Session.objects.filter(creator=creator).delete()

        now = timezone.now()

        sessions_data = [
            {
                'title': 'Breathwork & Sound Healing Circle',
                'description': 'Join us for a transformative 90-minute journey using conscious connected breathing and crystal singing bowls to release tension and restore balance to your nervous system. Beginners welcome.',
                'price': 25.00,
                'datetime': now + timedelta(days=2, hours=18), # In 2 days at 6 PM
                'capacity': 15,
                'image_url': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop',
            },
            {
                'title': 'Intro to Vipassana Meditation',
                'description': 'A gentle introduction to the ancient technique of Vipassana (insight meditation). Learn how to observe your thoughts without judgment and build a sustainable daily practice.',
                'price': 0.00,
                'datetime': now + timedelta(days=5, hours=10), # In 5 days at 10 AM
                'capacity': 30,
                'image_url': 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?q=80&w=1200&auto=format&fit=crop',
            },
            {
                'title': 'Full Moon Ecstatic Dance',
                'description': 'Celebrate the full moon with a 2-hour guided free-form movement journey. Live DJ, cacao ceremony, and a safe, sober space to express yourself freely.',
                'price': 35.00,
                'datetime': now + timedelta(days=7, hours=20), # In 7 days at 8 PM
                'capacity': 50,
                'image_url': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
            },
            {
                'title': 'Mastering Portrait Photography',
                'description': 'An intensive workshop covering lighting setups, posing techniques, and how to make your subjects feel comfortable. Bring your own DSLR or mirrorless camera.',
                'price': 150.00,
                'datetime': now + timedelta(days=10, hours=14),
                'capacity': 8,
                'image_url': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop',
            },
            {
                'title': 'Sourdough Bread Baking Masterclass',
                'description': 'Learn the secrets of a perfect open crumb and crispy crust. We will cover starter maintenance, hydration levels, folding techniques, and scoring.',
                'price': 75.00,
                'datetime': now + timedelta(days=14, hours=9),
                'capacity': 12,
                'image_url': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop',
            },
            {
                'title': 'Creative Coding with p5.js',
                'description': 'Turn code into art! In this beginner-friendly session, you will learn how to generate algorithmic visuals, animations, and interactive web art using JavaScript.',
                'price': 45.00,
                'datetime': now + timedelta(days=3, hours=19),
                'capacity': 20,
                'image_url': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
            }
        ]

        for data in sessions_data:
            Session.objects.create(creator=creator, **data)

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(sessions_data)} sessions!'))
