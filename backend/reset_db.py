from app import app, db

with app.app_context():
    print("Deleting old database...")
    db.drop_all()  # This clears everything out
    print("Creating new database with email column...")
    db.create_all()
    print("✓ Success! Your database is now up to date.")