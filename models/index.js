import mongoose from 'mongoose';

// ── User ──────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  name:               { type: String, required: true, trim: true },
  email:              { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:           { type: String, required: true },
  role:               { type: String, enum: ['student', 'admin'], default: 'student' },
  class:              { type: String, enum: ['X', 'XII'], required: true },
  section:            { type: String, default: 'A' },
  rollNumber:         { type: String, required: true },
  fatherName:         String,
  phone:              String,
  village:            String,
  distanceFromSchool: { type: Number, default: 0 },
  isActive:           { type: Boolean, default: true },
  lastLogin:          Date,
  createdAt:          { type: Date, default: Date.now },
});
export const User = mongoose.models.User || mongoose.model('User', UserSchema);

// ── Note ──────────────────────────────────────────────────────────
const NoteSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  subject:        { type: String, enum: ['Python','Networks','Database','AI','General'], required: true },
  class:          { type: String, enum: ['X','XII','Both'], required: true },
  unit:           String,
  topic:          { type: String, required: true },
  content:        { type: String, required: true },
  syntax:         String,
  keyPoints:      [String],
  tips:           [String],
  commonMistakes: [String],
  tags:           [String],
  difficulty:     { type: String, enum: ['Basic','Intermediate','Advanced'], default: 'Basic' },
  order:          { type: Number, default: 0 },
  isPublished:    { type: Boolean, default: true },
  createdAt:      { type: Date, default: Date.now },
});
export const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema);

// ── Question ──────────────────────────────────────────────────────
const QuestionSchema = new mongoose.Schema({
  class:         { type: String, enum: ['X','XII','Both'] },
  subject:       String,
  topic:         String,
  questionType:  { type: String, enum: ['MCQ','TrueFalse','ShortAnswer'], required: true },
  question:      { type: String, required: true },
  options:       [String],
  correctAnswer: { type: String, required: true },
  hint:          String,
  explanation:   String,
  marks:         { type: Number, default: 1 },
  difficulty:    { type: String, enum: ['Easy','Medium','Hard'], default: 'Easy' },
  isActive:      { type: Boolean, default: true },
  createdAt:     { type: Date, default: Date.now },
});
export const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

// ── Test ──────────────────────────────────────────────────────────
const TestSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  class:       { type: String, enum: ['X','XII'], required: true },
  subject:     String,
  description: String,
  questions:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  totalMarks:  { type: Number, required: true },
  duration:    { type: Number, required: true },
  status:      { type: String, enum: ['draft','live','completed'], default: 'draft' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt:   { type: Date, default: Date.now },
});
export const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);

// ── Submission ────────────────────────────────────────────────────
const SubmissionSchema = new mongoose.Schema({
  testId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  studentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers:       [{
    questionId:   mongoose.Schema.Types.ObjectId,
    answer:       String,
    isCorrect:    Boolean,
    marksAwarded: Number,
  }],
  totalMarks:    Number,
  marksObtained: Number,
  percentage:    Number,
  grade:         String,
  timeUsed:      Number,
  submittedAt:   { type: Date, default: Date.now },
  status:        { type: String, enum: ['submitted','evaluated'], default: 'evaluated' },
});
export const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);

// ── Progress ──────────────────────────────────────────────────────
const ActivitySchema = new mongoose.Schema({
  activityType: String,   // 'note_read','code_run','sql_run','test_taken','class_joined'
  subject:      String,
  topic:        String,
  score:        Number,
  duration:     Number,
  details:      String,
  timestamp:    { type: Date, default: Date.now },
}, { _id: false });

const ProgressSchema = new mongoose.Schema({
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:         { type: String, required: true },
  activities:   [ActivitySchema],
  dailyMinutes: { type: Number, default: 0 },
  lastActive:   Date,
});
ProgressSchema.index({ studentId: 1, date: 1 });
export const Progress = mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);

// ── LiveClass ─────────────────────────────────────────────────────
const LiveClassSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  String,
  class:        { type: String, enum: ['X','XII','Both'], required: true },
  subject:      String,
  topic:        String,
  scheduledAt:  { type: Date, required: true },
  duration:     { type: Number, default: 60 },
  meetingId:    { type: String, required: true },
  status:       { type: String, enum: ['scheduled','live','ended'], default: 'scheduled' },
  recordingUrl: String,
  attendees:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt:    { type: Date, default: Date.now },
});
export const LiveClass = mongoose.models.LiveClass || mongoose.model('LiveClass', LiveClassSchema);

// ── Attendance ────────────────────────────────────────────────────
const AttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId:   { type: mongoose.Schema.Types.ObjectId, ref: 'LiveClass' },
  date:      { type: Date, required: true },
  status:    { type: String, enum: ['present','absent'], default: 'present' },
  joinedAt:  Date,
});
export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);

// ── Setting ───────────────────────────────────────────────────────
const SettingSchema = new mongoose.Schema({
  key:       { type: String, unique: true },
  value:     mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now },
});
export const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
