import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../utils/db.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { fileURLToPath } from 'url';

dotenv.config();

/**
 * Professional seed script
 * - Clear DB
 * - Create demo users/listings/bookings/reviews
 * - Print concise demo credentials
 */
const hashPassword = async (plain) => bcrypt.hash(plain, 10);

const seedData = async () => {
  await connectDB();
  try {
    // Order matters for referential integrity when clearing
    await Promise.all([
      Review.deleteMany({}),
      Booking.deleteMany({}),
      Listing.deleteMany({}),
      User.deleteMany({}),
    ]);

    console.log('✅ Cleared existing collections');

    // Demo credentials and user definitions
    const DEMO = {
      admin: { name: 'Admin User', email: 'mdsaad@admin.com', mobile: '01900000000', password: 'saad1289', role: 'admin' },
      owners: [
        { name: 'Ahmed Owner', email: 'ahmed@example.com', mobile: '01711111111', password: 'owner123456', role: 'owner', isVerified: true },
        { name: 'Fatima Hostel', email: 'fatima@example.com', mobile: '01722222222', password: 'owner123456', role: 'owner', isVerified: true },
      ],
      students: [
        { name: 'Karim Student', email: 'karim@example.com', mobile: '01733333333', password: 'student123456', role: 'student', isVerified: true },
        { name: 'Nadia Ahmed', email: 'nadia@example.com', mobile: '01744444444', password: 'student123456', role: 'student', isVerified: true },
      ],
    };

    // Create admin (assign plain password to `passwordHash` field so pre-save hook hashes it once)
    const adminUser = await User.create({
      name: DEMO.admin.name,
      email: DEMO.admin.email,
      mobile: DEMO.admin.mobile,
      passwordHash: DEMO.admin.password,
      role: DEMO.admin.role,
      isVerified: true,
    });

    // Create owners (plain password -> hashed by model pre-save)
    const owners = await Promise.all(DEMO.owners.map(async (o) => User.create({
      name: o.name,
      email: o.email,
      mobile: o.mobile,
      passwordHash: o.password,
      role: o.role,
      isVerified: o.isVerified,
    })));

    // Create students (plain password -> hashed by model pre-save)
    const students = await Promise.all(DEMO.students.map(async (s) => User.create({
      name: s.name,
      email: s.email,
      mobile: s.mobile,
      passwordHash: s.password,
      role: s.role,
      isVerified: s.isVerified,
    })));

    console.log('✅ Created demo users');

    // Create listings (small, clear dataset)
    const [listing1, listing2, listing3] = await Listing.create([
      {
        ownerId: owners[0]._id,
        title: 'Premium Mess in Dhanmondi',
        address: '123 Dhanmondi Lake Road, Dhaka',
        city: 'Dhaka',
        type: 'mess',
        rent: 8000,
        deposit: 15000,
        genderAllowed: 'male',
        meals: { available: true, type: 'all' },
        facilities: { wifi: true, tv: true, ac: false, studyTable: true, balcony: true },
        photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'],
        rules: 'No noise after 11 PM. Keep room clean.',
        verified: true,
        badges: ['verified'],
      },
      {
        ownerId: owners[1]._id,
        title: 'Female Friendly Hostel',
        address: '456 Gulshan Avenue, Dhaka',
        city: 'Dhaka',
        type: 'hostel',
        rent: 6500,
        deposit: 12000,
        genderAllowed: 'female',
        meals: { available: true, type: 'breakfast' },
        facilities: { wifi: true, tv: true, ac: true, studyTable: true, security: true },
        photos: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'],
        rules: 'Curfew at 10 PM. Common area cleaning roster.',
        verified: true,
        badges: ['verified', 'femaleFriendly'],
      },
      {
        ownerId: owners[0]._id,
        title: 'Budget Mess in Mirpur',
        address: '789 Mirpur Road, Dhaka',
        city: 'Dhaka',
        type: 'mess',
        rent: 5000,
        deposit: 10000,
        genderAllowed: 'both',
        meals: { available: false, type: 'none' },
        facilities: { wifi: true, studyTable: true },
        photos: ['https://images.unsplash.com/photo-1549187774-b4f0f0e7a2d0?auto=format&fit=crop&w=1200&q=80'],
        rules: 'Self-catering allowed. Keep kitchen clean.',
        verified: false,
        badges: [],
      },
    ]);

    console.log('✅ Created sample listings');

    // Bookings
    const booking1 = await Booking.create({ listingId: listing1._id, studentId: students[0]._id, status: 'completed', moveInDate: new Date('2025-01-01'), notes: 'Looking for a peaceful place to study' });
    const booking2 = await Booking.create({ listingId: listing2._id, studentId: students[1]._id, status: 'accepted', moveInDate: new Date('2026-02-15'), notes: 'Need female friendly space' });
    console.log('✅ Created sample bookings');

    // Reviews
    await Review.create({ bookingId: booking1._id, listingId: listing1._id, studentId: students[0]._id, ownerId: owners[0]._id, ratings: { food: 4, cleanliness: 5, safety: 5, owner: 4, facilities: 4, study: 5 }, textReview: 'Great place! Clean and owner is very cooperative. Food quality is good.', ownerReply: 'Thank you for staying with us! Hope to see you again.', repliedAt: new Date() });
    console.log('✅ Created sample reviews');

    // Summary
    console.log('\n✅ Seed data created successfully');
    console.log('Demo credentials:');
    console.log(`  Admin:   ${DEMO.admin.email} / ${DEMO.admin.password}`);
    console.log(`  Owner:   ${DEMO.owners[0].email} / ${DEMO.owners[0].password}`);
    console.log(`  Student: ${DEMO.students[0].email} / ${DEMO.students[0].password}`);

  } catch (err) {
    console.error('Error seeding data:', err);
    throw err;
  } finally {
    await disconnectDB();
  }
};

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile) {
  seedData().then(() => process.exit(0)).catch(() => process.exit(1));
}

export default seedData;
