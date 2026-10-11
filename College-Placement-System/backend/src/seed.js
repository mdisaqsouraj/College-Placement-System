import { validateEnv } from './config/env.js';
validateEnv();
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import { PracticeQuestion } from './models/Practice.js';
import { ROLES } from './constants.js';

const Q = 'Quantitative Aptitude', L = 'Logical Reasoning', V = 'Verbal Ability', D = 'Data Interpretation';
// [category, topic, difficulty, text, options, correctIndex, explanation]
const QUESTIONS = [
  [Q, 'Percentages', 'easy', 'What is 20% of 250?', ['40', '50', '60', '25'], 1, '250 x 20/100 = 50.'],
  [Q, 'Averages', 'easy', 'What is the average of 10, 20, 30, 40 and 50?', ['25', '30', '35', '40'], 1, 'Sum 150 / 5 = 30.'],
  [Q, 'Time and Work', 'medium', 'A can finish a job in 12 days and B in 24 days. Working together, how many days do they need?', ['6', '8', '9', '10'], 1, '1/12 + 1/24 = 1/8, so 8 days.'],
  [Q, 'Profit and Loss', 'medium', 'An item bought for Rs 800 is sold at 25% profit. What is the selling price?', ['Rs 950', 'Rs 1000', 'Rs 1050', 'Rs 1200'], 1, '800 x 1.25 = 1000.'],
  [Q, 'Probability', 'hard', 'Two fair dice are rolled. What is the probability that the sum is 8?', ['1/6', '5/36', '1/9', '7/36'], 1, 'Favourable: (2,6),(3,5),(4,4),(5,3),(6,2) = 5 of 36.'],
  [Q, 'Speed, Distance, Time', 'hard', 'A 150 m long train crosses a pole in 10 s. How long will it take to cross a 250 m platform?', ['20 s', '25 s', '26.67 s', '30 s'], 2, 'Speed 15 m/s; distance 400 m; time 400/15 = 26.67 s.'],
  [L, 'Number Series', 'easy', 'What comes next: 2, 4, 8, 16, ?', ['24', '32', '30', '64'], 1, 'Each term doubles.'],
  [L, 'Odd One Out', 'easy', 'Which is the odd one out: Apple, Banana, Carrot, Mango?', ['Apple', 'Banana', 'Carrot', 'Mango'], 2, 'Carrot is a vegetable; the rest are fruits.'],
  [L, 'Blood Relations', 'medium', "Pointing to a man, Riya says, 'He is the son of my mother's only brother.' How is the man related to Riya?", ['Brother', 'Cousin', 'Uncle', 'Nephew'], 1, "Her mother's brother's son is her cousin."],
  [L, 'Syllogisms', 'medium', 'All cats are animals. Some animals are wild. Conclusion: Some cats are wild.', ['Definitely true', 'Definitely false', 'Cannot be determined', 'Both true and false'], 2, 'The wild animals may or may not include cats.'],
  [L, 'Seating Arrangement', 'hard', 'Five friends A, B, C, D, E sit in a row. A is to the left of B, C is to the right of B, D is at the left end and E is not at the right end. Who sits at the right end?', ['A', 'B', 'C', 'E'], 2, 'A < B < C in order, so only C or E could be last; E cannot be, so C.'],
  [L, 'Coding-Decoding', 'hard', 'If CAT is written as DBU, how is DOG written?', ['EPH', 'ENH', 'CNF', 'EOH'], 0, 'Each letter moves one step forward: D->E, O->P, G->H.'],
  [V, 'Synonyms', 'easy', "Choose the synonym of 'Rapid'.", ['Slow', 'Quick', 'Late', 'Weak'], 1, 'Rapid means quick.'],
  [V, 'Grammar', 'easy', 'She ___ to school every day.', ['go', 'goes', 'going', 'gone'], 1, 'Third person singular present takes "goes".'],
  [V, 'Antonyms', 'medium', "Choose the antonym of 'Scarce'.", ['Rare', 'Plentiful', 'Limited', 'Thin'], 1, 'Scarce means in short supply; plentiful is the opposite.'],
  [V, 'Sentence Correction', 'medium', 'Choose the correct sentence.', ["He don't like tea.", "He doesn't likes tea.", "He doesn't like tea.", 'He not like tea.'], 2, 'After "doesn\'t" the verb stays in base form.'],
  [V, 'Idioms', 'hard', "'To burn the midnight oil' means:", ['To waste resources', 'To work late into the night', 'To start a fire', 'To feel angry'], 1, 'It means studying or working late at night.'],
  [V, 'Vocabulary', 'hard', "What does 'Ephemeral' mean?", ['Lasting forever', 'Short-lived', 'Very large', 'Mysterious'], 1, 'Ephemeral things last a very short time.'],
  [D, 'Tables', 'easy', 'A shop sold 40 pens on Monday and 60 on Tuesday. What is the total?', ['90', '100', '110', '120'], 1, '40 + 60 = 100.'],
  [D, 'Percentage Change', 'easy', 'Sales rose from 200 to 250 units. What is the percentage increase?', ['20%', '25%', '30%', '50%'], 1, '(250-200)/200 = 25%.'],
  [D, 'Pie Charts', 'medium', 'In a pie chart, a 90 degree sector represents what percentage of the total?', ['20%', '25%', '30%', '40%'], 1, '90/360 = 25%.'],
  [D, 'Ratios', 'medium', 'Sales of A and B are in the ratio 3:5 and total Rs 1600. What are the sales of B?', ['Rs 600', 'Rs 800', 'Rs 1000', 'Rs 1200'], 2, '1600 x 5/8 = 1000.'],
  [D, 'Growth Rates', 'hard', 'A value of 1000 grows 10% in year 1 and 20% in year 2. What is the final value?', ['1300', '1320', '1330', '1400'], 1, '1000 x 1.1 x 1.2 = 1320.'],
  [D, 'Averages', 'hard', 'Five students average 62 marks. A sixth student scoring 80 joins. What is the new average?', ['64', '65', '66', '68'], 1, '(310 + 80)/6 = 65.'],
];

await connectDB();
const email = (process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase(), pw = process.env.SEED_ADMIN_PASSWORD || '';
if (email && pw.length >= 10) {
  if (await User.exists({ email })) console.log(`Admin ${email} already exists`);
  else { await User.create({ name: process.env.SEED_ADMIN_NAME || 'TPO Admin', email, role: ROLES.ADMIN, passwordHash: await bcrypt.hash(pw, 12) }); console.log(`Created TPO admin ${email}`); }
} else console.log('Skipped admin creation: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (min 10 chars) in .env');

if (!(await PracticeQuestion.countDocuments())) {
  await PracticeQuestion.insertMany(QUESTIONS.map(([category, topic, difficulty, text, options, correctIndex, explanation]) => ({ category, topic, difficulty, text, options, correctIndex, explanation })));
  console.log(`Seeded ${QUESTIONS.length} practice questions`);
} else console.log('Practice questions already present');
await mongoose.disconnect();
