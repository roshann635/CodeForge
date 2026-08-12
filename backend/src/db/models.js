import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password_hash: { type: String }, // null for oauth
  avatar_url: { type: String },
  track: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'], 
    default: 'beginner' 
  },
  current_streak: { type: Number, default: 0 },
  longest_streak: { type: Number, default: 0 },
  last_active_date: { type: Date }
}, { timestamps: true });

const ProblemSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    required: true 
  },
  category: { type: String, required: true },
  pattern: { type: String, required: true },
  constraints: { type: String },
  hints: [{ type: String }],
  editorial: { type: String },
  test_cases: { type: mongoose.Schema.Types.Mixed, required: true },
  templates: { type: mongoose.Schema.Types.Mixed, required: true },
  related_visualizer: { type: String }
}, { timestamps: true });

const SubmissionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  language: { 
    type: String, 
    enum: ['python', 'javascript', 'java', 'cpp'], 
    required: true 
  },
  code: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'running', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compile_error'],
    default: 'pending'
  },
  runtime_ms: { type: Number },
  memory_kb: { type: Number },
  test_results: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

const VisualizerProgressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  explored_at: { type: Date, default: Date.now }
});
// Compound unique index
VisualizerProgressSchema.index({ user_id: 1, topic: 1 }, { unique: true });

const LearnProgressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  completed_at: { type: Date, default: Date.now }
});
LearnProgressSchema.index({ user_id: 1, topic: 1 }, { unique: true });

const BookmarkSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resource_type: { 
    type: String, 
    enum: ['visualizer', 'learn', 'problem'], 
    required: true 
  },
  resource_id: { type: String, required: true },
  note: { type: String }
}, { timestamps: true });
BookmarkSchema.index({ user_id: 1, resource_type: 1, resource_id: 1 }, { unique: true });

export const User = mongoose.model('User', UserSchema);
export const Problem = mongoose.model('Problem', ProblemSchema);
export const Submission = mongoose.model('Submission', SubmissionSchema);
export const VisualizerProgress = mongoose.model('VisualizerProgress', VisualizerProgressSchema);
export const LearnProgress = mongoose.model('LearnProgress', LearnProgressSchema);
export const Bookmark = mongoose.model('Bookmark', BookmarkSchema);
